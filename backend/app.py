from flask import Flask, jsonify, request, render_template
from pytrends.request import TrendReq
import os

# Debugging: Check if the folders exist
print("Template Folder Exists:", os.path.exists('../frontend/template'))
print("Static Folder Exists:", os.path.exists('../frontend/static'))

# Initialize Flask
app = Flask(__name__, 
            template_folder='../frontend/template',
            static_folder='../frontend/static')

# Initialize PyTrends
pytrends = TrendReq(hl='en-US', tz=360)

# Valid countries for trending searches
VALID_COUNTRIES = {
    'argentina': 'AR', 'australia': 'AU', 'brazil': 'BR', 'canada': 'CA',
    'france': 'FR', 'germany': 'DE', 'india': 'IN', 'italy': 'IT', 'japan': 'JP',
    'mexico': 'MX', 'netherlands': 'NL', 'norway': 'NO', 'sweden': 'SE',
    'united_kingdom': 'GB', 'united_states': 'US', 'syria': 'SY', 'lebanon': 'LB',
    'egypt': 'EG', 'saudi_arabia': 'SA', 'uae': 'AE', 'morocco': 'MA',
    'algeria': 'DZ', 'iraq': 'IQ', 'jordan': 'JO', 'qatar': 'QA', 'kuwait': 'KW',
    'oman': 'OM', 'tunisia': 'TN', 'bahrain': 'BH'
}

# Function to map country names to Google Trends format
def get_google_trends_country_name(country):
    country_mapping = {
        'argentina': 'argentina', 'australia': 'australia', 'brazil': 'brazil', 'canada': 'canada',
        'france': 'france', 'germany': 'germany', 'india': 'india', 'italy': 'italy', 'japan': 'japan',
        'mexico': 'mexico', 'netherlands': 'netherlands', 'norway': 'norway', 'sweden': 'sweden',
        'united_kingdom': 'united_kingdom', 'united_states': 'united_states', 'syria': 'syria', 'lebanon': 'lebanon',
        'egypt': 'egypt', 'saudi_arabia': 'saudi_arabia', 'uae': 'united_arab_emirates', 'morocco': 'morocco',
        'algeria': 'algeria', 'iraq': 'iraq', 'jordan': 'jordan', 'qatar': 'qatar', 'kuwait': 'kuwait',
        'oman': 'oman', 'tunisia': 'tunisia', 'bahrain': 'bahrain'
    }
    return country_mapping.get(country, None)

@app.route("/")
def home():
    # Mock data to display initially
    trends = ["Trend 1", "Trend 2", "Trend 3"]  
    return render_template("index.html", trends=trends)

@app.route('/api/get-trends', methods=['GET'])
def get_trends():
    try:
        # Get the 'country' parameter from the request (default to 'norway')
        country = request.args.get('country', 'norway').lower()

        # Check if the country is valid
        if country not in VALID_COUNTRIES:
            return jsonify({'error': f"Invalid country: {country}. Valid options: {list(VALID_COUNTRIES.keys())}"}), 400

        # Get the correct Google Trends country name
        google_country_name = get_google_trends_country_name(country)
        if not google_country_name:
            return jsonify({'error': f"Country {country} is not supported by Google Trends"}), 400

        # Fetch trending searches for the specified country
        trends_data = pytrends.trending_searches(pn=google_country_name)
        trending_now = trends_data[0].tolist() if not trends_data.empty else ["No data available"]
        
        return jsonify({'trends': trending_now})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to fetch trends'}), 500

#Linking til HTML siden via FLASK server.
@app.route('/index')
def index():
    return render_template('index.html')

# Custom 404 Error Page
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# Card flip siden
@app.route('/card')
def card():
    return render_template('card.html')

# Interactive Siden
@app.route('/interactive')
def interactive():
    return render_template('interactive.html')

if __name__ == '__main__':
    app.run(debug=True)
