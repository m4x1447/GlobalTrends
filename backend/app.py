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
    'argentina': 'AR',  # Argentina
    'australia': 'AU',  # Australia
    'brazil': 'BR',     # Brazil
    'canada': 'CA',     # Canada
    'france': 'FR',     # France
    'germany': 'DE',    # Germany
    'india': 'IN',      # India
    'italy': 'IT',      # Italy
    'japan': 'JP',      # Japan
    'mexico': 'MX',     # Mexico
    'netherlands': 'NL',# Netherlands
    'new_zealand': 'NZ',# New Zealand
    'norway': 'NO',     # Norway
    'spain': 'ES',      # Spain
    'sweden': 'SE',     # Sweden
    'united_kingdom': 'GB',  # United Kingdom (UK)
    'united_states': 'US'    # United States
}

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
            return jsonify({'error': f"Invalid country: {country}. Valid options: {VALID_COUNTRIES}"}), 400
        
        # Fetch trending searches for the specified country
        trends_data = pytrends.trending_searches(pn=country)
        trending_now = trends_data[0].tolist() if not trends_data.empty else ["No data available"]
        
        return jsonify({'trends': trending_now})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to fetch trends'}), 500

#Linking til HTML siden via FLASK server.
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



'''
from flask import Flask, render_template, request, jsonify
from pytrends.request import TrendReq
import os

app = Flask(__name__, 
            template_folder='../frontend/template',
            static_folder='../frontend/static')

# Initialize Pytrends
pytrends = TrendReq(hl='en-US', tz=360)

@app.route('/')
def home():
    # Get the trending searches in Norway
    trending_searches_norway = pytrends.trending_searches(pn='norway')
    
    # Convert the trends to a list for easy display
    trending_list = trending_searches_norway[0].tolist()  # Convert the first column to a list
    
    # Render the HTML page and pass the trending searches
    return render_template('index.html', trends=trending_list)

if __name__ == '__main__':
    app.run(debug=True)
'''