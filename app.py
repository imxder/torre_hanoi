from flask import Flask, render_template, request, flash

app = Flask(__name__)
app.secret_key = 'hanoi_flask_secret'

MAX_DISKS = 10

def hanoi_solver_list(n, source, destination, auxiliary):
    moves = []
    def solve(k, src, dest, aux):
        if k > 0:
            solve(k - 1, src, aux, dest)
            moves.append((src, dest))
            solve(k - 1, aux, dest, src)
    solve(n, source, destination, auxiliary)
    return moves

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            disks_str = request.form['disks']
            if not disks_str:
                flash('O número de discos não pode estar vazio.', 'error')
                return render_template('index.html', max_disks=MAX_DISKS)
            
            disks = int(disks_str)
            start_tower = int(request.form['start_tower'])
            end_tower = int(request.form['end_tower'])

            if disks <= 0:
                flash('O número de discos deve ser um inteiro positivo.', 'error')
                return render_template('index.html', max_disks=MAX_DISKS)

            if disks > MAX_DISKS:
                flash(f'O número máximo de discos permitido é {MAX_DISKS}.', 'error')
                return render_template('index.html', max_disks=MAX_DISKS)
           
            if start_tower not in [1, 2, 3] or end_tower not in [1, 2, 3]:
                flash('As torres devem ser 1, 2 ou 3.', 'error')
                return render_template('index.html', max_disks=MAX_DISKS)

            if start_tower == end_tower:
                flash('A torre inicial e final devem ser diferentes.', 'error')
                return render_template('index.html', max_disks=MAX_DISKS)

            auxiliary_tower = 6 - start_tower - end_tower
            moves = hanoi_solver_list(disks, start_tower, end_tower, auxiliary_tower)

            print("\n=============================================")
            print(f"  Torre de Hanói: {disks} Discos")
            print(f"  Origem: {start_tower} | Destino: {end_tower}")
            print("=============================================")
            print("  Movimentos:")
            for i, (src, dest) in enumerate(moves):
                print(f"  {i+1:03d}. Mover disco da Torre {src} para a Torre {dest}")
            print("=============================================\n")

            return render_template('solve.html', disks=disks, start=start_tower, end=end_tower, moves=moves)

        except ValueError:
            flash('Por favor, insira valores numéricos válidos.', 'error')
            return render_template('index.html', max_disks=MAX_DISKS)

    return render_template('index.html', max_disks=MAX_DISKS)

if __name__ == '__main__':
    app.run(debug=True)