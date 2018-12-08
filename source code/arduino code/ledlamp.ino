#include <PubSubClient.h>
#include <ESP8266WiFi.h>

const char *ssid = "WIFI-NAME-HERE";
const char *password = "WIFI-PASSWORD-HERE";
const char *mqttServer = "MQTT-SERVER-ADDRESS";
const int serverPort = MQTT-SERVER-PORT;
unsigned long lastMillis = 0;
WiFiClient espclient;
PubSubClient client(espclient);

int redPin = D1;
int greenPin = D2;
int bluePin = D3;
int whitePin = D4;
int powerPin = D5;
int redValue = 0;
int greenValue = 402;
int blueValue = 1023;
int whiteValue = 0;
int valueRed = 0;
int valueGreen = 0;
int valueBlue = 0;
int valueWhite = 0;
float brightness = 1;
bool changed = false;
String currentColor = "empty";
bool lampOn = false;

void setup()
{
    ;
    Serial.begin(115200);
    Serial.println();
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    delay(2000);

    Serial.println("connecting to MQTT broker...");
    client.setServer(mqttServer, serverPort);
    client.setCallback(callback);

    delay(2000);

    pinMode(redPin, OUTPUT);
    pinMode(greenPin, OUTPUT);
    pinMode(bluePin, OUTPUT);
    pinMode(whitePin, OUTPUT);
    pinMode(powerPin, OUTPUT);
    analogWrite(powerPin, 1024);
}

void connect()
{
    while (!client.connected())
    {
        String clientID = "lamp";
        if (client.connect(clientID.c_str()))
        {
            Serial.println("connected");
            client.subscribe("lamp/currentColor");
            client.subscribe("lamp/status");
        }
        else
        {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 secconds..");
            delay(5000);
        }
    }
}

void loop()
{

    if (!client.connected())
    {
        connect();
        Serial.println("connecting to lamp/currentColor");
    }
    if (lampOn == true)
    {
        analogWrite(powerPin, int(brightness * 1024));
    }
    else
    {
        analogWrite(powerPin, 0);
    }
    if (changed == true)
    {
        int commaIndex = currentColor.indexOf(',');
        int secondCommaIndex = currentColor.indexOf(',', commaIndex + 1);
        int thirdCommaIndex = currentColor.indexOf(',', secondCommaIndex + 1);
        int fourthCommaIndex = currentColor.indexOf(',', thirdCommaIndex + 1);

        brightness = (currentColor.substring(0, commaIndex)).toFloat();
        valueRed = (int(4 * (currentColor.substring(commaIndex + 1, secondCommaIndex).toInt())));
        valueGreen = (int(4 * (currentColor.substring(secondCommaIndex + 1, thirdCommaIndex).toInt())));
        valueBlue = (int(4 * (currentColor.substring(thirdCommaIndex + 1, fourthCommaIndex).toInt())));
        valueWhite = (int(4 * (currentColor.substring(fourthCommaIndex + 1).toInt())));

        Serial.print("Brightness: ");
        Serial.println(brightness);
        Serial.print("RED: ");
        Serial.println(valueRed);
        Serial.print("GREEN: ");
        Serial.println(valueGreen);

        Serial.print("BLUE: ");
        Serial.println(valueBlue);
        Serial.print("WHITE: ");
        Serial.println(valueWhite);
        publishData("lamp/activeColor", String(valueRed / 4) + "," + String(valueGreen / 4) + "," + String(valueBlue / 4) + "," + String(valueWhite / 4));

        setColor(valueRed, valueGreen, valueBlue, valueWhite);
    }

    changed = false;
    client.loop();
    delay(100);
}

void callback(char *topic, byte *payload, unsigned int length)
{
    String msg;
    Serial.print("Topic: ");
    Serial.println(String(topic));
    for (int i = 0; i < length; i++)
    {
        msg += (char)payload[i];
    }

    Serial.println("msg: " + msg);
    if (String(topic) == "lamp/currentColor")
    {
        currentColor = msg;
        changed = true;
    }

    if (String(topic) == "lamp/status")
    {
        if (msg == "on")
        {
            lampOn = true;
        }
        else if (msg == "off")
        {
            lampOn = false;
        }
    }
}

void publishData(String sTopic, String sMessage)
{
    const char *cTopic = sTopic.c_str();
    const char *cMessage = sMessage.c_str();
    client.publish(cTopic, cMessage);
}

void setColor(int redValue, int greenValue, int blueValue, int whiteValue)
{
    analogWrite(redPin, redValue);
    analogWrite(greenPin, greenValue);
    analogWrite(bluePin, blueValue);
    analogWrite(whitePin, whiteValue);
}
