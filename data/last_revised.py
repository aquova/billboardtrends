import requests
import time
import json
import re
import csv
import random
from requests_oauthlib import OAuth1

API_KEY = '3e79f6602a2d50486c9e964066e20428'
API_SECRET = '0260128686b24ca1eaabd7ef38516276'

with open('us_billboard.psv') as f:

    psv = csv.reader(f, delimiter='|')

    psv_list = list(psv)
    artists = []
    # while True:
    for row in psv_list:
        # row = random.choice(psv_list)

        track = row[4]
        artist = row[5]

        artist = re.sub(' featuring.*', '', artist)

        if artist in artists:
            continue

        artists.append(artist)

        payload = {
            'method': 'artist.getTopTags',
            # 'track': track,
            'artist': artist,
            'format': 'json',
            'api_key': API_KEY
        }

        r = requests.get('http://ws.audioscrobbler.com/2.0', params=payload)
        top_tags = json.loads(r.content)


        if ('error' in top_tags or len(top_tags['toptags']['tag']) < 5):

            artist = re.sub(' \&.*', '', artist)
            artist = re.sub(',.*', '', artist)
            artist = re.sub('\'', '', artist)
            artist = re.sub(' x .*', '', artist)

            payload = {
                'method': 'artist.getTopTags',
                # 'track': track,
                'artist': artist,
                'format': 'json',
                'api_key': API_KEY
            }

            r = requests.get('http://ws.audioscrobbler.com/2.0', params=payload)
            top_tags = json.loads(r.content)

            if 'toptags' not in top_tags or len(top_tags['toptags']['tag']) == 0:
                continue


        genre = top_tags['toptags']['tag'][0]['name']
        genre = genre.lower()

        if (genre in ['indie','grunge','new wave','blues','djent','alternative'] or 'rock' in genre or 'metal' in genre):
            clean_genre = 'rock'
        elif (genre in ['rap','hip hop','cloud rap','trap']):
            clean_genre = 'hip-hop'
        elif (genre in ['female vocalists', 'male vocalists','adult contemporary','oldies'] or 'pop' in genre or any(char.isdigit() for char in genre)):
            clean_genre = 'pop'
        elif (genre in ['trance','house','drum and bass','breakcore','dubstep'] or 'dance' in genre):
            clean_genre = 'electronic'
        elif (genre in ['country', 'folk', 'singer-songwriter']):
            clean_genre = 'country / folk'
        elif (genre in ['soul','rnb','motown','new jack swing'] or 'funk' in genre):
            clean_genre = 'rnb / soul'
        elif (genre in ['swing','jazz']):
            clean_genre = 'jazz'
        elif (genre in ['disco']):
            clean_genre = 'disco'
        elif (genre in ['reggae','dub']):
            clean_genre = 'reggae'
        else:
            clean_genre = genre

        with open("genre.psv", 'a', encoding='utf-8') as openFile:
            openFile.write("{}|{}|{}\n".format(artist, clean_genre, genre))


        # print("{}|{}|{}\n".format(artist, clean_genre, genre))

        time.sleep(.2)
