from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Configuração CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///marketplace.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelo do banco de dados
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)

# Inicializar o banco de dados
with app.app_context():
    db.create_all()

# Rota principal
@app.route('/')
def home():
    return jsonify({"message": "Bem-vindo ao Marketplace Virtual!"})

# Listar produtos
@app.route('/products', methods=['GET'])
def get_products():
    try:
        products = Product.query.all()
        return jsonify([{
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "stock": p.stock
        } for p in products])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Adicionar produto
@app.route('/add-product', methods=['POST'])
def add_product():
    data = request.json
    new_product = Product(
        name=data['name'],
        price=data['price'],
        stock=data['stock']
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({"message": "Produto adicionado com sucesso!"}), 201

# Atualizar produto
@app.route('/update-product/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Produto não encontrado."}), 404

    data = request.json
    product.name = data['name']
    product.price = data['price']
    product.stock = data['stock']
    db.session.commit()

    return jsonify({"message": "Produto atualizado com sucesso!"})

# Deletar produto
@app.route('/delete-product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Produto não encontrado."}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Produto deletado com sucesso!"})

# Favicon vazio para evitar erro
@app.route('/favicon.ico')
def favicon():
    return "", 204

# Iniciar servidor
if __name__ == '__main__':
    app.run(debug=True)
 
