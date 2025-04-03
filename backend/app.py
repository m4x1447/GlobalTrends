from flask import Flask, jsonify, request, render_template, Response
from pytrends.request import TrendReq
import os
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import io
import time

# Debugging: Check if the folders exist
print("Template Folder Exists:", os.path.exists('../frontend/template'))
print("Static Folder Exists:", os.path.exists('../frontend/static'))

# Initialize Flask
app = Flask(__name__, 
            template_folder='../frontend/template',
            static_folder='../frontend/static')

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

# Caching funksjon med 1 time cache-tid
def get_cached_trends(country_code):
    cache_file = CACHE_DIR / f"{country_code}.csv"
    
    if cache_file.exists():
        modified_time = cache_file.stat().st_mtime
        if (time.time() - modified_time) < 3600:  # 1 time cache
            return pd.read_csv(cache_file)
    
    # Hvis ikke cachet eller utløpt
    return None

# Retry-logikk med eksponentiell backoff
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def safe_fetch_trends(country_code):
    trends_data = pytrends.trending_searches(pn=country_code)
    time.sleep(10)  # 10 sekunder pause mellom forespørsler
    return trends_data

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
        max_retries = 3
        for attempt in range(max_retries):
            try:
                trends_data = pytrends.trending_searches(pn=google_country_name)
                print(f"Raw trends data: {trends_data}")
                if trends_data is not None and not trends_data.empty:
                    trending_now = trends_data[0].tolist()
                    return jsonify({'trends': trending_now})
                else:
                    print("No data received from Google Trends")
                    return jsonify({'error': 'No trending data available'}), 404
            except Exception as trend_error:
                print(f"Attempt {attempt + 1} failed: {str(trend_error)}")
                if attempt == max_retries - 1:  # Last attempt
                    print(f"All {max_retries} attempts failed")
                    return jsonify({'error': f'Failed to fetch trends after {max_retries} attempts'}), 500
                import time
                time.sleep(2)  # Wait 2 seconds before retrying
            
    except Exception as e:
        print(f"General error: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({'error': f'Failed to fetch trends: {str(e)}'}), 500


# Resten av rutene med cache og rate limiting
@app.route('/wordcloud-data')
def wordcloud_data():
    countries = ['united_states', 'united_kingdom', 'india', 'france', 'germany']
    all_trends = {}
    
    for country in countries:
        google_country_name = get_google_trends_country_name(country)
        if google_country_name:
            try:
                cached_data = get_cached_trends(google_country_name)
                
                if cached_data is None:
                    trends_data = safe_fetch_trends(google_country_name)
                    trends_data.to_csv(CACHE_DIR / f"{google_country_name}.csv")
                else:
                    trends_data = cached_data
                
                if not trends_data.empty:
                    for trend in trends_data[0].tolist():
                        all_trends[trend] = all_trends.get(trend, 0) + 1
                time.sleep(5)  # Ekstra pause mellom land
            except Exception as e:
                print(f"Feil ved henting av trender for {country}: {e}")

    wordcloud_data = [{"text": word, "weight": weight} for word, weight in all_trends.items()]
    return jsonify(wordcloud_data)

# Behold resten av rutene uendret
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
    all_trends = {}
    
    for country in countries:
        google_country_name = get_google_trends_country_name(country)
        if google_country_name:
            try:
                cached_data = get_cached_trends(google_country_name)
                
                if cached_data is None:
                    trends_data = safe_fetch_trends(google_country_name)
                    trends_data.to_csv(CACHE_DIR / f"{google_country_name}.csv")
                else:
                    trends_data = cached_data
                
                if not trends_data.empty:
                    for trend in trends_data[0].tolist():
                        all_trends[trend] = all_trends.get(trend, 0) + 1
                time.sleep(5)
            except Exception as e:
                print(f"Feil ved henting av trender for {country}: {e}")

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