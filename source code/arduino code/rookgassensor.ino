#include <PubSubClient.h>
#include <ESP8266WiFi.h>

const char *ssid = "WIFI-NAME-HERE";
const char *password = "WIFI-PASSWORD-HERE";
const char *mqttServer = "MQTT-SERVER-ADDRESS";
const int serverPort = MQTT-SERVER-PORT;
unsigned long lastMillis = 0;
const char *buzzStatus = "Off";
unsigned long buzzBlackOut = 0;
WiFiClient WiFiclient;
MQTTClient client;
const int timeOut = 1800000;

int redLed = D3;
int greenLed = D2;
int buzzer = D1;
int smokeA0 = A0;
int sensorThresMQ2 = 350;
int sensorThresMQ7 = 450;
int sensorValueMQ2 = 0;
int sensorValueMQ7 = 0;
void setup()
{
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

  pinMode(redLed, OUTPUT);
  pinMode(greenLed, OUTPUT);
  pinMode(buzzer, OUTPUT);
  pinMode(smokeA0, INPUT);
}

void connect()
{
  while (!client.connected())
  {
    String clientID = "rookGasSensor";
    if (client.connect(clientID.c_str()))
    {
      Serial.println("connected");
      client.subscribe("rookGaSsensor/command");
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
  if (buzzStatus == "On" && buzzBlackOut < millis())
  {
    tone(buzzer, 3000);
  }
  else
  {
    noTone(buzzer);
  }

  if (!client.connected())
  {
    connect();
  }

  if (millis() - lastMillis > timeOut)
  {

    changeMux(0);
    delay(100);
    sensorValueMQ2 = analogRead(smokeA0);
    publishData("rookGaSsensor/current/mq2", sensorValueMQ2);
    changeMux(1);
    delay(100);
    sensorValueMQ7 = analogRead(smokeA0);
    publishData("rookGaSsensor/current/mq7", sensorValueMQ7);

    if (sensorValueMQ2 > sensorThresMQ2)
    {
      digitalWrite(redLed, HIGH);
      digitalWrite(greenLed, LOW);
      buzzStatus = "On";
    }
    else if (sensorValueMQ7 > sensorThresMQ7)
    {
      digitalWrite(redLed, HIGH);
      digitalWrite(greenLed, LOW);
      buzzStatus = "On";
    }
    else
    {
      digitalWrite(redLed, LOW);
      digitalWrite(greenLed, HIGH);
      buzzStatus = "Off";
    }

    Serial.print("Pin A0: ");
    Serial.println(analogSensor);

    lastMillis = millis();
    publishData("rookGasSensor/buzzStatus", String(buzzStatus));
  }

  delay(2000);
  client.loop();
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

  if (msg == "buzzOn")
  {
    buzzStatus = "On";
  }
  if (msg == "buzzOff")
  {
    buzzStatus = "Off";
  }
  if (msg == "buzzBlackOut")
  {
    buzzBlackOut = millis() + 10000;
  }

  Serial.println("buzzStatus after receive is: " + String(buzzStatus));
}

void publishData(String sTopic, String sMessage)
{
  const char *cTopic = sTopic.c_str();
  const char *cMessage = sMessage.c_str();
  client.publish(cTopic, cMessage);
}

void changeMux(int channel)
{
  int a;
  int b;
  int c;
  switch (channel)
  {
  case 0:
    a = LOW;
    b = LOW;
    c = LOW;
    break;
  case 1:
    a = LOW;
    b = LOW;
    c = HIGH;
    break;
  case 2:
    a = LOW;
    b = HIGH;
    c = LOW;
    break;
  case 3:
    a = LOW;
    b = HIGH;
    c = HIGH;
    break;
  case 4:
    a = HIGH;
    b = LOW;
    c = LOW;
    break;
  case 5:
    a = HIGH;
    b = LOW;
    c = HIGH;
    break;
  case 6:
    a = HIGH;
    b = HIGH;
    c = LOW;
    break;
  case 7:
    a = HIGH;
    b = HIGH;
    c = HIGH;
    break;
  }
  digitalWrite(muxA, a);
  digitalWrite(muxB, b);
  digitalWrite(muxC, c);
}
