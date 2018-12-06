import paho.mqtt.client as mqtt
from flask import Flask, request,abort
from flask_restful import Api, Resource, reqparse
import configparser, random, string
import urllib, requests, threading, time,random
from datetime import datetime, timedelta
import pickle

config = configparser.ConfigParser()
config.optionxform = str
config.read("config.ini")
mqttHost = config["Setup"]["mqttHost"]

app = Flask(__name__)
api = Api(app)

def on_message(client, userdate, message):
    split_topic = message.topic.split("/")
    for sensor in python_api.sensors:
        if sensor.data["name"] == split_topic[0]:
            if sensor.data["type"] == "vochtigheid":
                sensor.checkValue(message.payload)
            elif sensor.data["type"] == "rookgas":
                sensor.checkValue(message.payload, split_topic[2])

def pushover(title, message, url = None, urltitle = None):
    r = requests.post("https://api.pushover.net/1/messages.json", data = {
    "token": "",
    "user": "",
    "message": message,
    "title": title,
    "url": url,
    "url-title":urltitle,
    })
    # files = {
    # "attachment": ("image.jpg", open("your_image.jpg", "rb"), "image/jpeg")

class User:
    def __init__(self,name,password,access):
        self.username = name
        self.password = password
        if "all" in access:
            access = [sensor for sensor in config["Sensors"]]
        self.access = access
        self.token = "".join(random.choices(string.ascii_letters + string.digits, k=12))

class apy:
    mqtt_client = mqtt.Client("APY")
    mqtt_client.connect(mqttHost)
    mqtt_client.on_message = on_message
    mqtt_client.loop_start()


    def __init__(self, sensors, users):
        self.sensors = []
        self.users = []
        for sensor in sensors:
            if "vochtigheid" in sensor.lower():
                self.sensors.append(VochtigheidSensor(sensor))
                apy.mqtt_client.subscribe(sensor + "/current")
            elif "rookGas" in sensor:
                self.sensors.append(RookGasSensor(sensor))
                apy.mqtt_client.subscribe(sensor + "/current/mq2")
                apy.mqtt_client.subscribe(sensor + "/current/mq7")
            elif "camera" in sensor:
                self.sensors.append(camera(sensor))
            elif "lamp" in sensor:
                self.sensors.append(lamp(sensor))
        
        for username in users:
            user_data = config["Users"][username].split(",")
            self.users.append(User(username,user_data[0],user_data[1:] ))

class RookGasSensor:
    def __init__(self,name):
        cfg = config["Sensors"][name].split(",")
        self.data ={
            "name": name,
            "current":{
                "mq2":0,
                "mq7":0
            },
            "buzzStatus": "off",
            "displayName": cfg[2],
            "status": "ok",
            "type": "rookgas"
        }
        self.thresholds = {
            "mq2": [float(x) for x in cfg[0].split("-")],
            "mq7": [float(x) for x in cfg[1].split("-")],
        }
        self.muted = False
        self.public = True
        print(self.thresholds)

    def checkValue(self, value, value_type):
        self.data["current"][value_type] = float(value)

        if self.data["current"]["mq2"] > self.thresholds["mq2"][0] or self.data["current"]["mq7"] > self.thresholds["mq7"][0]:
            self.data["status"] = "warning"
            if self.data["buzzStatus"] == "on":
                apy.mqtt_client.publish(self.data["name"] + "/command", "buzzOff")
                self.data["buzzStatus"] = "off"

        if self.data["current"]["mq2"] > self.thresholds["mq2"][1] or self.data["current"]["mq7"] > self.thresholds["mq7"][1]:
            self.data["status"] = "critical"
            if self.data["buzzStatus"] == "off" and not self.muted: 
                self.data["buzzStatus"] = "on"
                apy.mqtt_client.publish(self.data["name"] + "/command", "buzzOn")
        else:
            self.data["status"] = "ok"
            if self.data["buzzStatus"] == "on":
                apy.mqtt_client.publish(self.data["name"] + "/command", "buzzOff")
                self.data["buzzStatus"] = "off"

    def command(self, command, duration=5):
        command = command.split("/")[1]
        self.data["buzzStatus"] = "on" if command == "buzzOn" else "off"
        if command == "buzzOff":
            self.data["buzzStatus"] = "off"
            self.muted = True
        else:
            self.data["buzzStatus"] = "on"

        apy.mqtt_client.publish(self.data["name"] + "/command", command)

class VochtigheidSensor:
    def __init__(self,name):
        cfg = config["Sensors"][name].split(",")
        self.data = {
            "name":name,
            "current":0,
            "displayName": cfg[2],
            "status": "ok",
            "timeLeft": 0,
            "type":"vochtigheid"
        }
        self.thresholds = {
            "low":[float(x) for x in  cfg[0].split("-")],
            "high":[float(x) for x in  cfg[1].split("-")]
        }

        self.pumpActive = False
        self.timeLeft = 0
        self.public = True

    def checkValue(self, value):
        value = float(value)
        self.data["current"] = value

        if value > self.thresholds["high"][0]:
            self.data["status"] = "warning"
            if value > self.thresholds["high"][1]:
                self.data["status"] = "critical"
        elif value < self.thresholds["low"][1]:
            self.data["status"] = "warning"
            if value < self.thresholds["low"][0]:
                self.data["status"] = "critical"
        else:
            self.data["status"] = "ok"


    def enable_pump(self, duration):
        self.data["timeLeft"] = duration
        while self.data["timeLeft"] > 0 and self.pumpActive:
            time.sleep(1)
            self.data["timeLeft"] -= 1
        if self.data["timeLeft"] <= 0:
            apy.mqtt_client.publish(self.data["name"] + "/command","pumpOff")
        self.pumpActive = False

    def command(self, command):
        command_split = command.split(":")
        if (len(command_split) == 2):
            duration = int(command_split[1])
            if (not self.pumpActive):
                self.pumpActive = True
                threading.Thread(target=self.enable_pump, args=[duration], name="pump").start()
            else:
                self.data["timeLeft"] = duration
        command_split = command_split[0].split("/")
        if command_split[1] == "pumpOn":
            self.pumpActive = True
        else:
            self.data["timeLeft"] = 0
            self.pumpActive = False

        apy.mqtt_client.publish(self.data["name"] + "/command", command_split[1])

class camera:
    def __init__(self, name):
        cfg = config["Sensors"][name].split(",")
        self.public = False
        self.data = {
            "url":cfg[1],
            "name":name,
            "displayName":cfg[0],
            "type":"camera"
        }
    
    def command(self, command):
        return self.data

class lamp:
    def __init__(self, name):
        cfg = config["Sensors"][name].split(",")
        self.public = False
        with open("data.pckl","rb") as data_file:
            color_array = pickle.load(data_file)
        self.data = {
            "brightness": 1,
            "colors": color_array,
            "status": False,
            "name":name,
            "displayName":cfg[0],
            "type":"lamp",
            "active": 0
        }

def hex_to_rgb(value):
    value = value.lstrip('#')
    lv = len(value)
    return list(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))

@app.route("/lamp/<string:operation>", methods=["POST"])
def post_lamp(operation):
    for username in python_api.users:
        if username.token == request.headers.get("token") and ("lamp" in username.access or "all" in username.access):
            user = username

    if "user" in locals():
        lamp = [sensor for sensor in python_api.sensors if sensor.data["name"] == "lamp"][0]
        data = request.get_json()
        if operation == "add":
            lamp.data["colors"].append(data["color"])
        elif operation == "edit":
            lamp.data["colors"][data["index"]] = data["color"]
        elif operation == "delete":
            del(lamp.data["colors"][data["index"]])
        elif operation == "brightness":
            lamp.data["brightness"] = data["brightness"]
        elif operation == "status":
            lamp.data["status"] = data["status"]
        elif operation == "active":
            lamp.data["active"] = data["active"]

        rgb_color = hex_to_rgb(lamp.data["colors"][lamp.data["active"]])
        rgb_color = "0,0,0,{}".format(rgb_color[0]) if rgb_color[0] == rgb_color[2] == rgb_color[1] else ",".join([str(x) for x in rgb_color + [0]])
        message = "{},{}".format(lamp.data["brightness"], rgb_color)
        apy.mqtt_client.publish("lamp/currentColor", message)
        apy.mqtt_client.publish("lamp/status", "on" if lamp.data["status"] else "off")

        data_file = open("data.pckl","wb")
        pickle.dump(lamp.data["colors"],data_file)
        data_file.close()

        return "done",200
    else:
        return "no access",403
        
            
python_api = apy([sensor for sensor in config["Sensors"]], config["Users"])

class Sensor(Resource):
    def get(self, name):
        for username in python_api.users:
            if username.token == request.headers.get("token"):
                user = username 
        
        if "user" in locals():
            if name == "all":
                return [sensor.data for sensor in python_api.sensors if sensor.data["name"] != "lamp" and sensor.data["name"] in user.access]
            else:
                for sensor in python_api.sensors:
                    if sensor.data["name"] == name and name in user.access:
                        return sensor.data
        else:
            if name == "all":
                return [sensor.data for sensor in python_api.sensors if sensor.public]
            else:
                for sensor in python_api.sensors:
                    if sensor.data["name"] == name and sensor.public:
                        return sensor.data

        return "Sensor {} not found".format(name), 404
    
    def post(self, name):
        for username in python_api.users:
            if username.token == request.headers.get("token"):
                user = username 

        if "user" in locals():
            if name in user.access or "all" in user.access:
                args = request.get_json()
                message = name + "/" + args["command"] + ":" + str(args["duration"]) if "vochtigheid" in name and "duration" in args else name + "/" + args["command"]
                for sensor in python_api.sensors:
                    if sensor.data["name"] == name:
                        if sensor.data["type"] == "lamp":
                            sensor.command(args)
                        else:
                            sensor.command(message)
        else:
            return "no access",403

class Login(Resource):

    def post(self):
        for user in python_api.users:
            if user.username == request.get_json()["username"]: 
                username = user
        
        if "username" in locals():
            if request.get_json()["password"] == username.password:
                return  {
                        "token":username.token
                        }, 202  
        return "wrong username or password",403

api.add_resource(Sensor, "/sensor/<string:name>")
api.add_resource(Login, "/login")

if __name__ == "__main__":
    app.run()
