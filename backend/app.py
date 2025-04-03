from flask import Flask, jsonify, request, render_template, Response
from pytrends.request import TrendReq
import os
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import io
import time
import pandas as pd
from pathlib import Path

# Debugging: Check if the folders exist
print("Template Folder Exists:", os.path.exists('../frontend/template'))
print("Static Folder Exists:", os.path.exists('../frontend/static'))

# Initialize Flask
app = Flask(__name__, 
            template_folder='../frontend/template',
            static_folder='../frontend/static')

# Set up cache directory
CACHE_DIR = Path(__file__).parent / 'cache'
CACHE_DURATION = 3600  # Cache duration in seconds

# Create cache directory if it doesn't exist
if not CACHE_DIR.exists():
    CACHE_DIR.mkdir(parents=True)

# Initialize PyTrends with proper headers and timeouts
pytrends = TrendReq(
    hl='en-US',
    tz=360,
    timeout=(10,25),
    requests_args={
        'headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
        }
    }
)

# Valid countries for trending searches with their Google Trends codes
VALID_COUNTRIES = {
    'argentina': 'argentina', 
    'australia': 'australia', 
    'brazil': 'brazil', 
    'canada': 'canada',
    'france': 'france', 
    'germany': 'germany', 
    'india': 'india', 
    'italy': 'italy', 
    'japan': 'japan',
    'mexico': 'mexico', 
    'netherlands': 'netherlands', 
    'norway': 'norway', 
    'sweden': 'sweden',
    'united_kingdom': 'united_kingdom', 
    'united_states': 'united_states',
    'syria': 'syria', 
    'lebanon': 'lebanon', 
    'egypt': 'egypt', 
    'saudi_arabia': 'saudi_arabia', 
    'uae': 'uae', 
    'morocco': 'morocco', 
    'algeria': 'algeria', 
    'iraq': 'iraq', 
    'jordan': 'jordan', 
    'qatar': 'qatar', 
    'kuwait': 'kuwait', 
    'oman': 'oman', 
    'tunisia': 'tunisia', 
    'bahrain': 'bahrain'
}

# Function to map country names to Google Trends format
def get_google_trends_country_name(country):
    # Google Trends uses specific country codes
    country_mapping = {
        'argentina': 'argentina', 
        'australia': 'australia', 
        'brazil': 'brazil', 
        'canada': 'canada',
        'france': 'france', 
        'germany': 'germany', 
        'india': 'india', 
        'italy': 'italy', 
        'japan': 'japan',
        'mexico': 'mexico', 
        'netherlands': 'netherlands', 
        'norway': 'norway', 
        'sweden': 'sweden',
        'united_kingdom': 'united_kingdom', 
        'united_states': 'united_states',
        'syria': 'syria', 
        'lebanon': 'lebanon', 
        'egypt': 'egypt', 
        'saudi_arabia': 'saudi_arabia', 
        'uae': 'uae', 
        'morocco': 'morocco', 
        'algeria': 'algeria', 
        'iraq': 'iraq', 
        'jordan': 'jordan', 
        'qatar': 'qatar', 
        'kuwait': 'kuwait', 
        'oman': 'oman', 
        'tunisia': 'tunisia', 
        'bahrain': 'bahrain'
    }
    return country_mapping.get(country, None)

def safe_fetch_trends(country, max_retries=3):
    """Safely fetch trends with retry mechanism"""
    for attempt in range(max_retries):
        try:
            pytrends.trending_searches(pn=country)
            trends = pytrends.trending_searches(pn=country)
            return trends
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(2 * (attempt + 1))  # Exponential backoff
    return pd.DataFrame()  # Return empty DataFrame if all retries fail

def get_cached_trends(country):
    """Get trends from cache if available and not expired"""
    cache_file = CACHE_DIR / f"{country}.csv"
    
    if not cache_file.exists():
        return None
        
    # Check if cache is expired
    if time.time() - cache_file.stat().st_mtime > CACHE_DURATION:
        return None
        
    try:
        return pd.read_csv(cache_file)
    except Exception:
        return None

def fetch_trends_for_countries(countries):
    """Fetch trends for multiple countries with caching"""
    all_trends = {}
    
    for country in countries:
        google_country_name = get_google_trends_country_name(country)
        if not google_country_name:
            continue
            
        try:
            cached_data = get_cached_trends(google_country_name)
            
            if cached_data is None:
                trends_data = safe_fetch_trends(google_country_name)
                if not trends_data.empty:
                    trends_data.to_csv(CACHE_DIR / f"{google_country_name}.csv")
            else:
                trends_data = cached_data
            
            if not trends_data.empty:
                for trend in trends_data[0].tolist():
                    all_trends[trend] = all_trends.get(trend, 0) + 1
            
            time.sleep(2)  # Reduced sleep time between requests
        except Exception as e:
            print(f"Error fetching trends for {country}: {e}")
            
    return all_trends

@app.route("/")
def home():
    trends = ["Trend 1", "Trend 2", "Trend 3"]  
    return render_template("index.html", trends=trends)

@app.route('/api/get-trends', methods=['GET'])
def get_trends():
    print("Got request on /api/get-trends")
    try:
        country = request.args.get('country', 'norway').lower()
        print(f"Got request on /api/get-trends where country is {country}")
        
        if country not in VALID_COUNTRIES:
            print(f"This country was not valid {country}")
            return jsonify({'error': f"Invalid country: {country}. Valid options: {list(VALID_COUNTRIES.keys())}"}), 400

        google_country_name = VALID_COUNTRIES[country]
        print(f"Google country name: {google_country_name}")

        print("Attempting to fetch trends from PyTrends...")
        try:
            cached_data = get_cached_trends(google_country_name)
            
            if cached_data is None:
                trends_data = safe_fetch_trends(google_country_name)
                if not trends_data.empty:
                    trends_data.to_csv(CACHE_DIR / f"{google_country_name}.csv")
                    trending_now = trends_data[0].tolist()
                else:
                    return jsonify({'error': 'No trending data available'}), 404
            else:
                trending_now = cached_data[0].tolist()
            
            return jsonify({'trends': trending_now})
            
        except Exception as e:
            print(f"Error fetching trends: {str(e)}")
            return jsonify({'error': f'Failed to fetch trends: {str(e)}'}), 500
            
    except Exception as e:
        print(f"General error: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({'error': f'Failed to fetch trends: {str(e)}'}), 500

@app.route('/wordcloud-data')
def wordcloud_data():
    countries = ['united_states', 'united_kingdom', 'india', 'france', 'germany']
    all_trends = fetch_trends_for_countries(countries)
    wordcloud_data = [{"text": word, "weight": weight} for word, weight in all_trends.items()]
    return jsonify(wordcloud_data)

@app.route('/index')
def index():
    return render_template('index.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.route('/card')
def card():
    return render_template('card.html')

@app.route('/interactive')
def interactive():
    return render_template('interactive.html')

@app.route('/wordcloud')
def wordcloud():
    countries = ['united_states', 'united_kingdom', 'india', 'france', 'germany']
    all_trends = fetch_trends_for_countries(countries)

    wordcloud = WordCloud(
        width=800,
        height=400,
        background_color="white",
        colormap='coolwarm',
        min_font_size=10,
        max_font_size=100,
        max_words=50,
    ).generate_from_frequencies(all_trends)

    img = io.BytesIO()
    wordcloud.to_image().save(img, format='PNG')
    img.seek(0)
    return Response(img, mimetype='image/png')

@app.route('/wordcloud-view')
def wordcloudview():
    return render_template('wordcloudview.html')

if __name__ == '__main__':
    app.run(debug=True)