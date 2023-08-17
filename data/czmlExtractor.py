from poliastro.bodies import Earth
from poliastro.twobody import Orbit
from poliastro.czml.extract_czml import CZMLExtractor
from astropy import units as u
import czml3
from datetime import datetime, timedelta
import os
import json

folder_path = r"E:\Msc Geospatial Science\Dissertation\Dissertation\Qihang\Final-Research-Project-2021_09-main\fsp21\fsp21\data\catalogue"

# Get a list of all JSON files in the specified directory
file_list = [f for f in os.listdir(folder_path) if f.endswith('.json')]

# Iterate through the list of files
for file_name in file_list:
    if file_name.startswith('fspcat'):
        start_epoch_str = file_name[6:15]
        if start_epoch_str == "_baseline":
            start_epoch = datetime.strptime("20190522", "%Y%m%d")  # If the date_str is '_baseline', assign a default date
        elif start_epoch_str == "_test.jso":
            continue
        else:
            start_epoch = datetime.strptime(start_epoch_str[1:], "%Y%m%d")  # Else, parse the date from the string
        # print(start_epoch)

    # Construct the full file path
    file_path = os.path.join(folder_path, file_name)

    # Open the file and load the JSON data
    with open(file_path, 'r') as file:
        data = json.load(file)
        debris = data['debris']

    # 对每个debris创建轨道
    for d in debris:
        a = float(d['semi_major_axis']) * u.km
        ecc = float(d['eccentricity']) * u.one
        inc = float(d['inclination']) * u.rad
        raan = float(d['RAAN']) * u.deg
        argp = float(d['argument_of_perigee']) * u.deg
        nu = float(d['true_anomaly']) * u.deg


        orb = Orbit.from_classical(Earth, a, ecc, inc, raan, argp, nu)

# # 定义轨道起始和结束时间
# start_epoch = datetime.now().isoformat()
# end_epoch = (datetime.now() + timedelta(hours=1)).isoformat()
#
# # 从Kepler元素创建轨道
# a = 7000 * u.km  # Semi-major axis
# ecc = 0.01 * u.one  # Eccentricity
# inc = 0.01 * u.deg  # Inclination
# raan = 0 * u.deg  # Right Ascension of Ascending Node
# argp = 0 * u.deg  # Argument of Perigee
# nu = 0 * u.deg  # True Anomaly
#
# orb = Orbit.from_classical(Earth, a, ecc, inc, raan, argp, nu)
#
# # 创建CZMLExtractor实例
# extractor = CZMLExtractor(start_epoch, end_epoch, 360)
#
# # 添加轨道
# extractor.add_orbit(orb, label_text="Orbit")
#
# # 获得CZML
# czml = extractor.packets
#
# # 转换CZML为JSON格式字符串
# czml_str = str(czml)
#
# print(czml_str)
# # 输出CZML JSON
# # Save the CZML JSON to a file
# # with open('output.czml', 'w') as f:
# #     f.write(czml_str)
