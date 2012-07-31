#!/bin/bash
for i in {1..10}
do
   node test.js&
   echo "thread $i started";
done
