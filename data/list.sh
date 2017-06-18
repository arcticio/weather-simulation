#!/bin/bash


for dir in */; do 

  # echo $dir;

  ls -l ${dir} | sort | head -3

done