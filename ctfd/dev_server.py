import os
import json
from flask import Flask, render_template, send_from_directory, request, jsonify

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')

# Mock CTFd context
class MockConfig:
    def get(self, key, default=None):
        configs = {
            'ctf_name': 'Stellar Vector CTF',
            'user_mode': 'users',
            'tokens': True,
        }
        return configs.get(key, default)

def get_config(key, default=None):
    return MockConfig().get(key, default)

def url_for(endpoint, **values):
    if endpoint == 'views.themes':
        path = values.get('path', '')
        return f'/static/{path}'
    
    mapping = {
        'challenges.listing': '/challenges',
        'scoreboard.listing': '/scoreboard',
        'users.private': '/profile',
        'users.settings': '/settings',
        'views.settings': '/settings',
        'auth.login': '/login',
        'auth.register': '/register',
        'auth.logout': '/logout',
        'auth.reset_password': '/reset_password',
        'auth.forgot_password': '/forgot_password',
        'index': '/'
    }
    
    if endpoint in mapping:
        return mapping[endpoint]
        
    return f'/{endpoint.replace(".", "/")}'

def authed():
    return True

def is_admin():
    return True

def get_flashed_messages():
    return []

@app.context_processor
def inject_ctfd_mock():
    return dict(
        get_config=get_config,
        url_for=url_for,
        authed=authed,
        is_admin=is_admin,
        get_flashed_messages=get_flashed_messages,
        Session={'nonce': 'mock-nonce'},
        request=request,
        id=1,
        name='operator_one',
        email='operator@stellarvector.be',
        affiliation='Independent',
        website='https://stellarvector.be',
        country='BE',
        language='en',
        countries=[('BE', 'Belgium'), ('US', 'United States'), ('DE', 'Germany')],
        languages=[('en', 'English'), ('fr', 'French'), ('nl', 'Dutch')],
        tokens=[
            {'id': 1, 'description': 'Testing Token', 'created': '2026-09-20', 'expiration': '2027-09-20'}
        ],
        team_id=1,
        team_name='StellarVector',
        start='2026-09-20T12:00:00Z',
        end='2026-09-21T12:00:00Z'
    )

try:
    from markupsafe import Markup
except ImportError:
    from flask import Markup

# Mock Filters
@app.template_filter('tojson')
def tojson_filter(s):
    return Markup(json.dumps(s))

# API Routes
@app.route('/api/v1/challenges')
def api_challenges():
    return jsonify({
        'success': True,
        'data': [
            {'id': 1, 'name': 'Secure Vault', 'category': 'Web', 'value': 100, 'solves': 42, 'solved_by_me': True},
            {'id': 2, 'name': 'Broken Cryptosystem', 'category': 'Crypto', 'value': 250, 'solves': 15, 'solved_by_me': False},
            {'id': 3, 'name': 'Overflow Me', 'category': 'Pwn', 'value': 500, 'solves': 5, 'solved_by_me': False},
            {'id': 4, 'name': 'Hidden Signal', 'category': 'Radio', 'value': 150, 'solves': 20, 'solved_by_me': False},
            {'id': 5, 'name': 'Shell Master', 'category': 'Pwn', 'value': 1000, 'solves': 2, 'solved_by_me': False},
            {'id': 6, 'name': 'Locked Terminal', 'category': 'Pwn', 'value': 750, 'solves': 0, 'solved_by_me': False, 'template': '', 'script': '', 'type': 'standard', 'state': 'locked'},
            {'id': 7, 'name': 'JWT Leak', 'category': 'Web', 'value': 300, 'solves': 10, 'solved_by_me': False},
        ]
    })

@app.route('/api/v1/challenges/<int:challenge_id>')
def api_challenge(challenge_id):
    challenges = {
        1: {'id': 1, 'name': 'Secure Vault', 'category': 'Web', 'value': 100, 'solves': 42, 'description': '<p>Can you find the secret key hidden in the vault?</p>', 'files': ['/static/files/vault.zip']},
        2: {'id': 2, 'name': 'Broken Cryptosystem', 'category': 'Crypto', 'value': 250, 'solves': 15, 'description': '<p>Our engineers used a custom XOR implementation. It should be unbreakable.</p>', 'files': ['/static/files/crypto.py', '/static/files/output.txt']},
        3: {'id': 3, 'name': 'Overflow Me', 'category': 'Pwn', 'value': 500, 'solves': 5, 'description': '<p>A classic buffer overflow. Target is running at <code>pwn.stellarvector.be:1337</code></p>', 'files': ['/static/files/overflow']},
    }
    return jsonify({
        'success': True,
        'data': challenges.get(challenge_id, challenges[1])
    })

@app.route('/api/v1/scoreboard')
def api_scoreboard():
    return jsonify({
        'success': True,
        'data': [
            {'account_id': 1, 'name': 'StellarVector', 'score': 1337},
            {'account_id': 2, 'name': 'The Dutch Masters', 'score': 1200},
            {'account_id': 3, 'name': 'Root Force', 'score': 1150},
            {'account_id': 4, 'name': 'Cyber Junkies', 'score': 1000},
            {'account_id': 5, 'name': 'Null Pointers', 'score': 850},
            {'account_id': 6, 'name': 'Overflow Kings', 'score': 700},
            {'account_id': 7, 'name': 'Buffer Breakers', 'score': 650},
            {'account_id': 8, 'name': 'Shell Shockers', 'score': 500},
            {'account_id': 9, 'name': 'XOR Wizards', 'score': 450},
            {'account_id': 10, 'name': 'Flag Hunters', 'score': 300},
        ]
    })

@app.route('/api/v1/scoreboard/top/<int:count>')
def api_scoreboard_top(count):
    return jsonify({
        'success': True,
        'data': {
            '1': {
                'name': 'StellarVector',
                'solves': [
                    {'date': '2026-09-20T13:00:00Z', 'value': 500},
                    {'date': '2026-09-20T15:30:00Z', 'value': 837}
                ]
            },
            '2': {
                'name': 'The Dutch Masters',
                'solves': [
                    {'date': '2026-09-20T12:30:00Z', 'value': 1200}
                ]
            },
            '3': {
                'name': 'Root Force',
                'solves': [
                    {'date': '2026-09-20T14:00:00Z', 'value': 600},
                    {'date': '2026-09-20T16:45:00Z', 'value': 550}
                ]
            },
            '4': {
                'name': 'Cyber Junkies',
                'solves': [
                    {'date': '2026-09-20T15:00:00Z', 'value': 1000}
                ]
            },
            '5': {
                'name': 'Null Pointers',
                'solves': [
                    {'date': '2026-09-20T12:00:00Z', 'value': 400},
                    {'date': '2026-09-20T17:00:00Z', 'value': 450}
                ]
            }
        }
    })

@app.route('/api/v1/notifications')
def api_notifications():
    return jsonify({
        'success': True,
        'data': [
            {'id': 1, 'title': 'System Maintenance', 'content': 'Scheduled maintenance in 2 hours.', 'date': '2026-09-20 18:00'}
        ]
    })

# Page Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/rules')
def rules():
    return render_template('rules.html')

@app.route('/challenges')
def challenges_listing():
    return render_template('challenges.html')

@app.route('/scoreboard')
def scoreboard_listing():
    return render_template('scoreboard.html')

@app.route('/users/settings')
@app.route('/settings')
def users_settings():
    return render_template('users/settings.html', name='operator_one', email='operator@stellarvector.be')

@app.route('/users/private')
@app.route('/profile')
def users_private():
    user = {
        'name': 'operator_one',
        'score': 1337,
        'place': 1,
        'solves': [
            {'challenge': {'name': 'Broken Cryptosystem', 'category': 'Crypto', 'value': 500}, 'date': None},
            {'challenge': {'name': 'Overflow Me', 'category': 'Pwn', 'value': 837}, 'date': None}
        ]
    }
    return render_template('users/private.html', user=user)

@app.route('/login')
def auth_login():
    return render_template('login.html')

@app.route('/register')
def auth_register():
    return render_template('register.html')

@app.route('/forgot_password')
def auth_forgot_password():
    return render_template('forgot_password.html')

@app.route('/reset_password')
def auth_reset_password():
    return render_template('reset_password.html')

@app.route('/404')
def error_404():
    return render_template('errors/404.html'), 404

@app.route('/static/<path:path>')
def send_static(path):
    static_dir = os.path.join(os.getcwd(), 'static')
    return send_from_directory(static_dir, path)

if __name__ == '__main__':
    app.run(debug=True, port=8000)
