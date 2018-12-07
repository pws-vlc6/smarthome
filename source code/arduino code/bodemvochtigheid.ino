#include <PubSubClient.h>
#include <ESP8266WiFi.h>

const char *ssid = "WIFI-NAME-HERE";
const char *password = "WIFI-PASSWORD-HERE";
unsigned long lastMillis = 0;
WiFiClient WiFiclient;
PubSubClient client(WiFiclient);

const int sense_Pin = A0;
const int muxA = D1;
const int muxB = D2;
const int muxC = D3;
const int pumpSwitch = D4;
int sensValue = 0;
const int powerPin = D8;
float average = 0;
const int timeOut = 30000;

void setup()
{
    Serial.begin(115200);
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

    Serial.print("connecting to MQTT broker...");
    client.setServer("MQTT-SERVER-ADDRESS", SERVER-PORT);
    client.setCallback(callback);
    pinMode(muxA, OUTPUT);
    pinMode(muxB, OUTPUT);
    pinMode(muxC, OUTPUT);
    pinMode(powerPin, OUTPUT);
    pinMode(pumpSwitch, OUTPUT);

    delay(2000);
}

void connect()
{
    while (!client.connected())
    {
        String clientID = "vochtigheid";
        if (client.connect(clientID.c_str()))
        {
            Serial.println("connected");
            client.subscribe("bodemvochtigheid/command");
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
    }
    if (millis() - lastMillis > timeOut)
    {
        digitalWrite(powerPin, HIGH);
        delay(1000);
        changeMux(0);
        delay(100);
        sensValue = analogRead(A0);
        average = sensValue;
        publishData("bodemvochtigheid/channel0", String(sensValue));
        changeMux(7);
        delay(100);
        sensValue = analogRead(A0);
        average += sensValue;
        publishData("bodemvochtigheid/channel7", String(sensValue));
        changeMux(5);
        delay(100);
        sensValue = analogRead(A0);
        average += sensValue;
        publishData("bodemvochtigheid/channel5", String(sensValue));
        changeMux(3);
        delay(100);
        sensValue = analogRead(A0);
        average += sensValue;
        average = average / 4;
        publishData("bodemvochtigheid/channel3", String(sensValue));
        publishData("bodemvochtigheid/current", String(average));
        Serial.println("average = " + String(average));

        digitalWrite(powerPin, LOW);
        lastMillis = millis();
    }
    client.loop();
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

void callback(char *topic, byte *payload, unsigned int length)
{
    Serial.println("message received");
    Serial.println(String(topic));
    String msg = String((char *)payload);
    Serial.println(msg);
    if (msg == "pumpOn")
    {
        digitalWrite(pumpSwitch, HIGH);
    }
    if (msg == "pumpOff")
    {
        digitalWrite(pumpSwitch, LOW);
    }
}
void publishData(String sTopic, String sMessage)
{
    const char *cTopic = sTopic.c_str();
    const char *cMessage = sMessage.c_str();
    client.publish(cTopic, cMessage);
}
