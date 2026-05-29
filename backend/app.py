import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, 
    JWTManager, 
    jwt_required, 
    get_jwt_identity, 
    get_jwt
)
from datetime import datetime, timedelta 
import random
import string
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app) 

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'PD.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'pocket-hoiku-secret-key-2025' 

s = URLSafeTimedSerializer(app.config['JWT_SECRET_KEY'])

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

event_participants = db.Table('event_participants',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('event_id', db.Integer, db.ForeignKey('event.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='parent') 
    status = db.Column(db.String(20), nullable=False, default='approved')
    
    company_name = db.Column(db.String(150), nullable=True)
    contact_name = db.Column(db.String(100), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    
    verification_code = db.Column(db.String(6), nullable=True)
    verification_code_expires_at = db.Column(db.DateTime, nullable=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class PendingUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(50), nullable=False)

    company_name = db.Column(db.String(150), nullable=True)
    contact_name = db.Column(db.String(100), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(255), nullable=True)

    verification_code = db.Column(db.String(6), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    event_date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200), nullable=True, default='未定') 
    max_participants = db.Column(db.Integer, nullable=True, default=20)
    tags = db.Column(db.String(255), nullable=True) 
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_by = db.relationship('User', backref=db.backref('events', lazy=True))
    participants = db.relationship('User', secondary=event_participants,
                                   backref=db.backref('joined_events', lazy='dynamic'))

    def to_dict(self, include_participants=False):
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'event_date': self.event_date.isoformat(),
            'location': self.location,
            'max_participants': self.max_participants,
            'current_participants': len(self.participants), 
            'host_id': self.created_by_id, 
            'host_email': self.created_by.email,
            'company_name': self.created_by.company_name or "主催者",
            'tags': self.tags.split(',') if self.tags else [] 
        }
        if include_participants:
            data['participant_ids'] = [user.id for user in self.participants]
        return data
    
def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # 1〜5の評価
    comment = db.Column(db.Text, nullable=True)    # コメント
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # リレーション定義
    user = db.relationship('User', backref=db.backref('reviews', lazy=True))
    event = db.relationship('Event', backref=db.backref('reviews', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_name': self.user.contact_name or "匿名ユーザー",
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.strftime('%Y/%m/%d %H:%M')
        }

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"msg": "メールアドレスとパスワードは必須です"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "このメールアドレスは既に使用されています"}), 400

    user_role = 'parent'
    if email == 'manager@gmail.com':
        user_role = 'admin'

    pending_user = PendingUser.query.filter_by(email=email).first()
    code = generate_verification_code()

    if pending_user:
        pending_user.set_password(password)
        pending_user.role = user_role
        pending_user.verification_code = code
        pending_user.created_at = datetime.utcnow() 
    else:
        pending_user = PendingUser(
            email=email, 
            role=user_role
        )
        pending_user.set_password(password)
        pending_user.verification_code = code
        db.session.add(pending_user)

    db.session.commit()

    print("----------------------------------------------------", flush=True) 
    print(f"認証コード発行 (To: {email}): {code}", flush=True) 
    print("----------------------------------------------------", flush=True) 

    return jsonify({"msg": "認証コードを送信しました。メールを確認してください。", "email": email}), 201

@app.route('/api/register_host', methods=['POST'])
def register_host(): 
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([data.get(k) for k in ['email', 'password', 'company_name', 'contact_name', 'phone_number', 'address']]):
        return jsonify({"msg": "すべての項目は必須です"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "このメールアドレスは既に使用されています"}), 400

    pending_user = PendingUser.query.filter_by(email=email).first()
    code = generate_verification_code()

    if pending_user:
        pending_user.set_password(password)
        pending_user.company_name = data.get('company_name')
        pending_user.contact_name = data.get('contact_name')
        pending_user.phone_number = data.get('phone_number')
        pending_user.address = data.get('address')
        pending_user.role = 'host'
        pending_user.verification_code = code
        pending_user.created_at = datetime.utcnow()
    else:
        pending_user = PendingUser(
            email=email, 
            role='host',
            company_name=data.get('company_name'),
            contact_name=data.get('contact_name'),
            phone_number=data.get('phone_number'),
            address=data.get('address')
        )
        pending_user.set_password(password)
        pending_user.verification_code = code
        db.session.add(pending_user)

    db.session.commit()

    print("----------------------------------------------------", flush=True) 
    print(f"認証コード発行 (To: {email}): {code}", flush=True) 
    print("----------------------------------------------------", flush=True) 

    return jsonify({"msg": "認証コードを送信しました。メールを確認してください。", "email": email}), 201

@app.route('/api/verify_registration', methods=['POST'])
def verify_registration():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    if not email or not code:
        return jsonify({"msg": "Emailと認証コードは必須です"}), 400

    pending_user = PendingUser.query.filter_by(email=email).first()

    if not pending_user:
        return jsonify({"msg": "認証情報が見つかりません。再度登録からやり直してください。"}), 404
    
    if pending_user.verification_code != code:
        return jsonify({"msg": "認証コードが正しくありません"}), 400
        
    user_status = 'pending' if pending_user.role == 'host' else 'approved'
    
    new_user = User(
        email=pending_user.email,
        password_hash=pending_user.password_hash,
        role=pending_user.role,
        status=user_status,
        company_name=pending_user.company_name,
        contact_name=pending_user.contact_name,
        phone_number=pending_user.phone_number,
        address=pending_user.address
    )
    
    db.session.add(new_user)
    db.session.delete(pending_user) 
    db.session.commit()

    if new_user.role == 'host':
         return jsonify({"msg": "メール認証が完了しました。主催者アカウントの申請が完了し、運営の承認待ちです。"}), 201
    
    return jsonify({"msg": "アカウント登録が完了しました。"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        if user.role == 'host':
            if user.status == 'pending':
                return jsonify({"msg": "このアカウントは現在、運営の承認待ちです。"}), 403
            if user.status == 'rejected':
                return jsonify({"msg": "このアカウントの申請は拒否されました。"}), 403
            if user.status != 'approved':
                return jsonify({"msg": "ログインできません。運営にお問い合わせください。"}), 403

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={'role': user.role}
        )
        return jsonify(access_token=access_token, role=user.role), 200
    else:
        return jsonify({"msg": "メールアドレスまたはパスワードが正しくありません"}), 401

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"msg": "メールアドレスは必須です"}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if user:
        code = generate_verification_code()
        user.verification_code = code
        user.verification_code_expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        db.session.commit()

        print("----------------------------------------------------", flush=True)
        print(f"パスワードリセットコード発行 (To: {email}): {code}", flush=True)
        print("----------------------------------------------------", flush=True)
        
    return jsonify({"msg": "パスワードリセット用の認証コードを送信しました。", "email": email}), 200

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('password')

    if not all([email, code, new_password]):
        return jsonify({"msg": "すべての項目は必須です"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"msg": "ユーザー情報が見つかりません。"}), 404
        
    if user.verification_code != code:
        return jsonify({"msg": "認証コードが正しくありません"}), 400
        
    if user.verification_code_expires_at is None or \
       datetime.utcnow() > user.verification_code_expires_at:
        return jsonify({"msg": "認証コードの有効期限が切れています。再度リクエストしてください。"}), 400

    user.set_password(new_password)
    user.verification_code = None
    user.verification_code_expires_at = None
    db.session.commit()
    
    return jsonify({"msg": "パスワードが正常に更新されました。"}), 200

@app.route('/api/request-deletion-code', methods=['POST'])
@jwt_required()
def request_deletion_code():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    password = request.json.get('password', None)

    if not password:
        return jsonify({"msg": "パスワードは必須です"}), 400

    if user.role != 'parent':
        return jsonify({"msg": "この機能は保護者アカウント専用です"}), 403

    if not user.check_password(password):
        return jsonify({"msg": "パスワードが正しくありません"}), 401

    code = generate_verification_code()
    user.verification_code = code
    user.verification_code_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()

    print("----------------------------------------------------", flush=True)
    print(f"アカウント削除コード発行 (To: {user.email}): {code}", flush=True)
    print("----------------------------------------------------", flush=True)

    return jsonify({"msg": "認証コードを発行しました。ターミナルを確認してください。"}), 200

@app.route('/api/delete-account', methods=['POST']) 
@jwt_required()
def delete_account():
    current_user_id = int(get_jwt_identity())
    user = db.session.get(User, current_user_id)
    
    code = request.json.get('code', None)

    if not user:
        return jsonify({"msg": "ユーザーが見つかりません"}), 404

    if not code:
        return jsonify({"msg": "認証コードは必須です"}), 400

    if user.role != 'parent':
        return jsonify({"msg": "この機能は保護者アカウント専用です"}), 403

    if not user.check_password(password=request.json.get('password', '')): 
        pass

    if user.verification_code != code:
        return jsonify({"msg": "認証コードが正しくありません"}), 400
    
    if user.verification_code_expires_at is None or \
       datetime.utcnow() > user.verification_code_expires_at:
        return jsonify({"msg": "認証コードの有効期限が切れています。再度リクエストしてください。"}), 400

    user.joined_events = []
    
    Review.query.filter_by(user_id=user.id).delete()
    
    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "アカウントが正常に削除されました。"}), 200

@app.route('/api/events', methods=['POST'])
@jwt_required()
def create_event():
    claims = get_jwt()
    current_user_role = claims.get('role')
    if current_user_role != 'host':
        return jsonify({"msg": "イベント登録の権限がありません"}), 403 
        
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    event_date_str = data.get('event_date') 
    location = data.get('location')
    max_participants = data.get('max_participants')
    tags_list = data.get('tags', [])
    tags_str = ",".join(tags_list) if tags_list else ""

    if not title or not event_date_str:
        return jsonify({"msg": "タイトルと日付は必須です"}), 400
    try:
        event_date = datetime.fromisoformat(event_date_str)
    except ValueError:
        return jsonify({"msg": "日付の形式が正しくありません (YYYY-MM-DDTHH:MM)"}), 400
        
    current_user_id = get_jwt_identity()
    new_event = Event(
        title=title, 
        description=description, 
        event_date=event_date,
        location=location,
        max_participants=max_participants,
        created_by_id=current_user_id,
        tags=tags_str
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"msg": "イベントが登録されました"}), 201

@app.route('/api/events', methods=['GET'])
@jwt_required()
def get_events():
    current_user_id = int(get_jwt_identity())
    
    events = Event.query.order_by(Event.event_date.desc()).all()
    event_list = []
    
    for event in events:
        data = event.to_dict(include_participants=True)
        data['is_registered'] = current_user_id in data['participant_ids']
        if 'participant_ids' in data:
            del data['participant_ids']
            
        event_list.append(data)
        
    return jsonify(events=event_list), 200

@app.route('/api/events/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event_detail(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"msg": "イベントが見つかりません"}), 404
    
    current_user_id = int(get_jwt_identity())
    
    event_data = event.to_dict(include_participants=True)
    
    event_data['is_registered'] = current_user_id in event_data['participant_ids']
    
    return jsonify(event=event_data), 200

@app.route('/api/events/<int:event_id>/register', methods=['POST'])
@jwt_required()
def register_for_event(event_id):
    event = Event.query.get(event_id)
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not event:
        return jsonify({"msg": "イベントが見つかりません"}), 404
    if user.role != 'parent':
         return jsonify({"msg": "保護者アカウントのみ参加登録できます"}), 403
    if user in event.participants:
        return jsonify({"msg": "既に登録済みです"}), 400
    if len(event.participants) >= event.max_participants:
        return jsonify({"msg": "定員に達しています"}), 400
        
    event.participants.append(user)
    db.session.commit()
    return jsonify({"msg": "イベントに参加登録しました"}), 200

@app.route('/api/events/<int:event_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_event_registration(event_id):
    event = Event.query.get(event_id)
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not event:
        return jsonify({"msg": "イベントが見つかりません"}), 404
    if user not in event.participants:
        return jsonify({"msg": "このイベントには登録していません"}), 400
        
    event.participants.remove(user)
    db.session.commit()
    return jsonify({"msg": "イベントの参加をキャンセルしました"}), 200

@app.route('/api/host/events', methods=['GET'])
@jwt_required()
def get_my_hosted_events():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'host':
        return jsonify({"msg": "権限がありません"}), 403

    events = Event.query.filter_by(created_by_id=current_user_id).order_by(Event.event_date.desc()).all()
    event_list = [event.to_dict() for event in events]
    return jsonify(events=event_list), 200

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    event = Event.query.get(event_id)
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    if not event:
        return jsonify({"msg": "イベントが見つかりません"}), 404
    if claims.get('role') != 'host' or event.created_by_id != current_user_id:
        return jsonify({"msg": "このイベントを削除する権限がありません"}), 403
        
    db.session.delete(event)
    db.session.commit()
    return jsonify({"msg": "イベントを削除しました"}), 200

@app.route('/api/admin/pending_hosts', methods=['GET'])
@jwt_required()
def get_pending_hosts():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "管理者権限がありません"}), 403

    pending_hosts = User.query.filter_by(role='host', status='pending').all()
    
    host_list = []
    for host in pending_hosts:
        host_list.append({
            'id': host.id,
            'email': host.email,
            'company_name': host.company_name,
            'contact_name': host.contact_name,
            'phone_number': host.phone_number,
            'address': host.address
        })
        
    return jsonify(hosts=host_list), 200

@app.route('/api/admin/update_status', methods=['POST'])
@jwt_required()
def update_host_status():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"msg": "管理者権限がありません"}), 403

    data = request.get_json()
    user_id = data.get('user_id')
    new_status = data.get('new_status')

    if not user_id or new_status not in ['approved', 'rejected']:
        return jsonify({"msg": "無効なリクエストです"}), 400

    user = User.query.get(user_id)
    if not user or user.role != 'host':
        return jsonify({"msg": "対象の主催者が見つかりません"}), 404
        
    user.status = new_status
    db.session.commit()
    
    return jsonify({"msg": f"ユーザー (ID: {user_id}) のステータスを {new_status} に更新しました"}), 200

@app.route('/api/user/profile', methods=['GET', 'PUT'])
@jwt_required()
def user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "ユーザーが見つかりません"}), 404

    if request.method == 'GET':
        return jsonify({
            "email": user.email,
            "name": user.contact_name or "",
            "role": user.role
        }), 200

    data = request.get_json()
    new_name = data.get('name')
    new_email = data.get('email')

    if new_email:
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"msg": "このメールアドレスは既に使用されています"}), 400
        user.email = new_email

    if new_name is not None:
        user.contact_name = new_name

    db.session.commit()
    return jsonify({"msg": "プロフィールを更新しました"}), 200

@app.route('/api/user/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({"msg": "現在のパスワードと新しいパスワードが必要です"}), 400

    if not user.check_password(current_password):
        return jsonify({"msg": "現在のパスワードが正しくありません"}), 401

    user.set_password(new_password)
    db.session.commit()

    return jsonify({"msg": "パスワードを変更しました"}), 200

@app.route('/api/events/<int:event_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(event_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    rating = data.get('rating')
    comment = data.get('comment')

    if not rating:
        return jsonify({"msg": "評価（星の数）は必須です"}), 400

    existing_review = Review.query.filter_by(user_id=current_user_id, event_id=event_id).first()
    if existing_review:
        return jsonify({"msg": "すでにレビュー済みです"}), 400

    new_review = Review(
        user_id=current_user_id,
        event_id=event_id,
        rating=rating,
        comment=comment
    )
    db.session.add(new_review)
    db.session.commit()

    return jsonify({"msg": "レビューを送信しました"}), 201

@app.route('/api/events/<int:event_id>/reviews', methods=['GET'])
@jwt_required()
def get_event_reviews(event_id):
    reviews = Review.query.filter_by(event_id=event_id).order_by(Review.created_at.desc()).all()
    return jsonify(reviews=[r.to_dict() for r in reviews]), 200

@app.route('/api/parent/my_events', methods=['GET'])
@jwt_required()
def get_my_joined_events():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "ユーザーが見つかりません"}), 404

    joined_events = user.joined_events.order_by(Event.event_date.desc()).all()
    
    results = []
    for event in joined_events:
        event_data = event.to_dict()
        
        my_review = Review.query.filter_by(user_id=current_user_id, event_id=event.id).first()
        
        event_data['has_reviewed'] = True if my_review else False
        if my_review:
            event_data['my_review'] = my_review.to_dict()
            
        results.append(event_data)

    return jsonify(events=results), 200

@app.route('/api/public/host/<int:host_id>', methods=['GET'])
@jwt_required()
def get_public_host_profile(host_id):
    host = User.query.get(host_id)
    if not host or host.role != 'host':
        return jsonify({"msg": "主催者が見つかりません"}), 404

    company_info = {
        "company_name": host.company_name,
        "contact_name": host.contact_name, 
        "address": host.address,
        "phone_number": host.phone_number
    }

    host_events = Event.query.filter_by(created_by_id=host_id).all()
    event_ids = [e.id for e in host_events]

    reviews = Review.query.filter(Review.event_id.in_(event_ids)).order_by(Review.created_at.desc()).all()
    
    review_list = []
    for r in reviews:
        review_data = r.to_dict()
        review_data['event_title'] = r.event.title
        review_list.append(review_data)

    return jsonify({
        "host": company_info,
        "reviews": review_list
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001, use_reloader=False)