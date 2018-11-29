import requests
import time
import json
import re
import csv
import random
import datetime
import sys
from requests_oauthlib import OAuth1

API_KEY = '9bf80dfdb834452add05f33d8e735316'
API_SECRET = 'b0a55ce0e0f89e575432e7a0e2b4c6be'
genre_cache = {}
clean_genre_cache = {}

def main():
    clean_rows = []
    load_count = 0
    animation = "|/-\\"


    with open('us_billboard.psv') as f:

        psv = csv.reader(f, delimiter='|')

        if len(sys.argv) == 1:
            this_year = str(datetime.datetime.now().year)
            start_year = int(datetime.datetime.now().year)
        else:
            this_year = sys.argv[1]
            start_year = int(sys.argv[1])

        psv_list = list(psv)
        for i, row in enumerate(psv_list):
            chart_date = row[10]


            if int(chart_date[:4]) > start_year:
                continue



            # When you reach the previous year, write the current year's data to a csv

            if chart_date[:4] != this_year:

                with open(f'charts/{this_year}.csv', 'w+') as chart_file:
                    writer = csv.DictWriter(chart_file, clean_rows[0].keys())
                    writer.writeheader()
                    for chart_row in clean_rows:
                        writer.writerow(chart_row)

                clean_rows = []
                this_year = chart_date[:4]


            artist = row[5]

            genre, clean_genre, clean_artist = get_genre(artist)

            clean_rows.append({ 'this_week_position':row[0], 'last_week_position':row[1], 'track':row[4], 'artist':row[5].title(), 'clean_artist':clean_artist.title(), 'clean_genre':clean_genre, 'genre':genre,
                                'entry_date':re.sub('\-','',row[6]), 'entry_position':row[7], 'peak_position':row[8], 'total_weeks':row[9], 'chart_date':chart_date })

            print(f'Building {this_year}.csv (on month {chart_date[4:6]}) { animation[load_count % len(animation)] } ', end='\r')
            load_count += 1





def get_genre(artist):
    artist = re.sub(' featuring.*', '', artist)

    payload = {
        'method': 'artist.getTopTags',
        # 'track': track,
        'artist': artist,
        'format': 'json',
        'api_key': API_KEY
    }

    if artist in genre_cache:
        return genre_cache[artist], clean_genre_cache[artist], artist

    r = requests.get('http://ws.audioscrobbler.com/2.0', params=payload)
    top_tags = json.loads(r.content)

    time.sleep(.2)

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

        if artist in genre_cache:
            return genre_cache[artist], clean_genre_cache[artist], artist

        r = requests.get('http://ws.audioscrobbler.com/2.0', params=payload)
        top_tags = json.loads(r.content)

        if 'toptags' not in top_tags or len(top_tags['toptags']['tag']) == 0:
            genre_cache[artist] = 'unknown'
            clean_genre_cache[artist] = 'pop'
            return 'unknown','pop', artist


    genre = top_tags['toptags']['tag'][0]['name']
    genre = genre.lower()

    if (genre in ['indie','grunge','new wave','blues','djent','alternative'] or 'rock' in genre or 'metal' in genre):
        clean_genre = 'rock'
    elif (genre in ['rap','hip hop','cloud rap','trap','hip-hop']):
        clean_genre = 'hip-hop'
    elif (genre in ['female vocalists', 'male vocalists','adult contemporary','oldies'] or 'pop' in genre or any(char.isdigit() for char in genre)):
        clean_genre = 'pop'
    elif (genre in ['trance','house','drum and bass','breakcore','dubstep','electronic'] or 'dance' in genre):
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
        clean_genre = 'pop'

    genre_cache[artist] = genre
    clean_genre_cache[artist] = clean_genre

    return genre, clean_genre, artist



if __name__ == "__main__":
    main()









