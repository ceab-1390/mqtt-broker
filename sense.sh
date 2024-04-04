#!/bin/bash

while true
do
ping_result=$(ping -c 1 $1 |awk -F'[= ]' '{print $10}' | grep -v 0ms )
pingdata=$(echo $ping_result) 
temp_result=$(sensors | grep edge |awk -F'[+°]' '{print $2}')
home=$(df -h /home |grep -v "S.ficheros" |awk -F'[ %]'  '{print $12}')

status="{\"buton\":\"1\",\"status\":\"true\",\"mac\":\"E4:65:B8:B0:4D:64\"}"

mqtt pub -t 'ping' -h '127.0.0.1' -p 1883 -m "{\"data\":\"$pingdata\" , \"topic\":\"ping\"}" -u cesar -P debian
mqtt pub -t 'temp' -h '127.0.0.1' -p 1883 -m "{\"data\": \"$temp_result\", \"topic\":\"temp\"}" -u cesar -P debian
mqtt pub -t 'fs' -h '127.0.0.1' -p 1883 -m "{\"data\": \"$home\", \"topic\":\"fs\"}" -u cesar -P debian
mqtt pub -t 'buttonStatus' -h '127.0.0.1' -p 1883 -m $status -u cesar -P debian

#echo "{\"data\":\"$pingdata\" , \"topic\":\"ping\"}"
#echo $temp_result

done

