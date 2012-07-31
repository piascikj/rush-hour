#!/bin/bash
for i in {1..20}
do
   node test.js&
   echo "thread $i started";
done
