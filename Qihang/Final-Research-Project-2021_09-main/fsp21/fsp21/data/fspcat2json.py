# from sys import path
# path.append('/Users/lizhen/projects/GFC_v1.0/gfc/tools/plotLib_v3')
# import plotLib_v3
# from plotLib_v3 import *

import math
import json
from itertools import islice

version = 1.0

## refer to document: FSPCAT_Draft_v0.5
class SATCAT(object):

	def __init__(self):
		
		self.records_cat=[] ### for the processing of the fsp catalogue
		self.records_tle=[] ### for the processing of tle data
		# all the field names
		self.field_name_list=["COSPAR_ID","RSO_name","RSO_type","payload_operational_status","orbit_type", \
							 "application","owner","launch_site_code","launch_date","decay_date","orbital_period", \
							 "mass","maneuverable","spin_stabilised","inclination_deg","apogee_hgt","perigee_hgt","radar_cross_section", \
							 "characteristic_area","charactersitic_length","propulsion_type","orbital_status_code", \
							 "epoch_of_orbit","semi_major_axis","eccentricity","inclination","argument_of_perigee","RAAN","true_anomaly"]

	# read the catalogue datafile
	def read_fspcat(self,catalogue_filename):
		f = open(catalogue_filename)
		# skip the first line
		next(f)

		lines = f.readlines()
		num_invalid=0
		## process each line
		for  line_counter,line in enumerate(lines):
			line = line.rstrip('\n')
			line_counter=line_counter+1
			if line[192:202] == "1858-11-16":
				print ("invalide record")
				print (line)
				num_invalid = num_invalid +1
				continue

			h =0
			d=dict()

			d[self.field_name_list[h]] = line[0:10] # len 10
			h = h+1

			d[self.field_name_list[h]] = line[11:34] # len 23
			h = h+1

			d[self.field_name_list[h]] = line[35:40] # len 5
			h = h+1

			d[self.field_name_list[h]] = line[41:46] # len 5
			h = h+1

			d[self.field_name_list[h]] = line[47:52] # len 5
			h = h+1

			d[self.field_name_list[h]] = line[53:63] # len 10
			h = h+1
			
			d[self.field_name_list[h]] = line[64:69] # len 5
			h = h+1

			d[self.field_name_list[h]] = line[70:75] # len 5
			h = h+1
			
			d[self.field_name_list[h]] = line[76:86] # len 10
			h = h+1
			
			d[self.field_name_list[h]] = line[87:97] # len 10
			h = h+1
			
			d[self.field_name_list[h]] = line[98:105] # len 7
			h = h+1
			
			d[self.field_name_list[h]] = line[106:111] # len 5
			h = h+1
			
			d[self.field_name_list[h]] = line[112:117] # len 5
			h = h+1

			d[self.field_name_list[h]] = line[118:123] # len 5
			h = h+1
			
			d[self.field_name_list[h]] = line[124:129] # len 5
			h = h+1
			
			d[self.field_name_list[h]] = line[130:136] # len 6
			h = h+1

			d[self.field_name_list[h]] = line[137:143] # len 6
			h = h+1
			
			d[self.field_name_list[h]] = line[144:152] # len 8
			h = h+1

			d[self.field_name_list[h]] = line[153:163] # len 10
			h = h+1

			d[self.field_name_list[h]] = line[164:174] # len 10
			h = h+1

			d[self.field_name_list[h]] = line[175:185] # len 10
			h = h+1

			d[self.field_name_list[h]] = line[186:191] # len 5
			h = h+1

			d[self.field_name_list[h]] = line[192:202] # len 10
			h = h+1
			
			d[self.field_name_list[h]] = line[203:213] # len 10
			h = h+1

			d[self.field_name_list[h]] = line[214:224] # len 10
			h = h+1
			
			d[self.field_name_list[h]] = line[225:235] # len 10
			h = h+1

			d[self.field_name_list[h]] = line[236:246] # len 10
			h = h+1
			
			d[self.field_name_list[h]] = line[247:257] # len 10
			h = h+1

			d[self.field_name_list[h]] = line[258:268] # len 10
			h = h+1
			
			self.records_cat.append(d)

		f.close()
		
		print("Total record number: %d"%(line_counter))
		print("Invalid record number: %d"%(num_invalid))

	def read_fspcat_new(self,catalogue_filename):
		f = open(catalogue_filename)
		# skip the first line
		next(f)
		lines = f.readlines()
		num_invalid=0
		## process each line
		for line_counter,line in enumerate(lines):
			line = line.rstrip('\n')
			line_counter=line_counter+1
			d=dict()
			x = line.split(',')
			if x[22] == "1858-11-16":
				print ("invalide record")
				print (line)
				num_invalid = num_invalid +1
				continue
			for h in range(len(x)):
				d[self.field_name_list[h]] = x[h]

			self.records_cat.append(d)
		f.close()
		print("Total record number: %d"%(line_counter))
		print("Invalid record number: %d"%(num_invalid))

	def read_tle(self,tlefile):
		f = open(tlefile)
		lines = f.readlines()
		record_num=0
		for i in range(0,len(lines),3):
			line1 = lines[i].rstrip('\n')
			line2 = lines[i+1].rstrip('\n')
			line3 = lines[i+2].rstrip('\n')
			d=dict()
			d['name']=line1
			d['line1'] = line2
			d['line2'] = line3
			self.records_tle.append(d)
			record_num = record_num +1
		f.close()
		print("Total record number: %d"%(record_num))	
			

	# convert the catalogue dataset into two line elements
	def toTLE_json(self,jsonfilename):
		
		jsonfile = open(jsonfilename, 'w')
		jsonfile.write("{\n")
		jsonfile.write("\"debris\":[\n")
		str_json=""
		for item in self.records_tle:
			str = json.dumps(item)
			str += ',\n'
			str_json += str

		str_json = str_json[0:len(str_json)-2]
		jsonfile.write(str_json)
		jsonfile.write("\n]\n}")
		
	## convert this record to json format
	def toCAT_json(self,jsonfilename):
		jsonfile = open(jsonfilename, 'w')
		jsonfile.write("{\n")
		jsonfile.write("\"debris\":[\n")
		str_json=""
		for item in self.records_cat:
			str = json.dumps(item)
			str += ',\n'
			str_json += str

		str_json = str_json[0:len(str_json)-2]
		jsonfile.write(str_json)
		jsonfile.write("\n]\n}")

if __name__ == '__main__':
	
	a = SATCAT()
	
	# fspcat_file = "output_fsp/fspcat_20230101_v01.txt"
	# fspcat_file="output_fsp_new/fspcat_20230101_v01.csv"
	# outputfile="output_fsp_new/fspcat_20230101_v01.json"

	# fspcat_file = "fspcat_23_July/baseline_fspcat_20190522_v04_nodeb.csv"
	# outputfile="fspcat_23_July/baseline_fspcat_20190522_v04_nodeb.json"

	# fspcat_file = "fspcat_23_July/fspcat_20280101_v04_nodeb.csv"
	# outputfile="fspcat_23_July/fspcat_20280101_v04_nodeb.json"
	
	
	# fspcat_file = "output_fsp_simulation_220819/fspcat_20430701_v16_nodeb.csv"
	# outputfile="output_fsp_simulation_220819/fspcat_20430701_v16_nodeb.json"
	
	# fspcat_file = "fspcat43/fspcat_20430701_v270819_nodeb.csv"
	# outputfile="fspcat43/fspcat_20430701_v270819_nodeb.json"
	
	fspcat_file = "output_fsp_28082019/fspcat_20430701_v280819_nodeb.csv"
	outputfile="output_fsp_28082019/fspcat_20430701_v280819_nodeb.json"
	

	# tle_file="geo_tle.txt"
	# a.read_fspcat(fspcat_file)
	a.read_fspcat_new(fspcat_file)
	# a.read_tle(tle_file)

	a.toCAT_json(outputfile)
	# a.toTLE_json(outputfile)


	
