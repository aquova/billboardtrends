import json
import pandas as pd
import datetime as dt
from collections import OrderedDict
import re
import csv


albumDF = pd.read_csv('us_albums_short.csv', sep='|', names=['pos', 'last_pos', 'peak', 'num_weeks', 'album', 'artist', 'entry_date', 'entry_pos', 'peak_pos', 'num_weeks2', 'week'])
albumDF = albumDF.drop(['num_weeks2'], axis=1)
albumDF.last_pos = albumDF.last_pos.replace({"NEW": 0})
# df.loc[(df['First Season'] > 1990)] = 1
albumDF.last_pos = pd.to_numeric(albumDF['last_pos'])
albumDF.entry_date = pd.to_datetime(albumDF['entry_date'])
albumDF.last_pos = albumDF.index+1-albumDF.pos-100+albumDF.last_pos
albumDF['in'] = albumDF.index
# albumDF.week = pd.to_datetime(albumDF['week'])


print(albumDF)

albumDF.to_csv('us_albums_short_cleaned.csv')