document.addEventListener('DOMContentLoaded', () => {

    const towersElement = [
        document.getElementById('tower-1'),
        document.getElementById('tower-2'),
        document.getElementById('tower-3')
    ];
    const disksArea = document.getElementById('disks-area');
    const playPauseButton = document.getElementById('play-pause-button');
    const nextButton = document.getElementById('next-button');
    const resetButton = document.getElementById('reset-button');
    const speedSlider = document.getElementById('speed');
    const moveCounter = document.getElementById('move-counter');
    const showMovesButton = document.getElementById('show-moves-button');
    const movesListContainer = document.getElementById('moves-list-container');
    const movesListItems = document.querySelectorAll('#moves-list li');

    const diskHeight = 25;
    const maxDiskWidth = 140; 
    const minDiskWidth = 40;  
    const diskColors = ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#fca311', '#9b5de5', '#00bbf9'];

    let towers = [[], [], []];
    let diskElements = [];
    let currentMoveIndex = 0;
    let isPlaying = false;
    let timeoutId = null;

    function createDisks() {
        disksArea.innerHTML = '';
        diskElements = [];
        for (let i = 0; i < numDisks; i++) {
            const disk = document.createElement('div');
            disk.classList.add('disk');
            const width = maxDiskWidth - ((maxDiskWidth - minDiskWidth) / (numDisks - 1 + 0.001)) * i;
            disk.style.width = `${width}px`;
            disk.style.height = `${diskHeight}px`;
            disk.style.backgroundColor = diskColors[i % diskColors.length];
            disk.dataset.id = numDisks - i;
            disk.textContent = numDisks - i;
            disksArea.appendChild(disk);
            diskElements.push(disk);
        }
        diskElements.reverse();
    }

    function initializeTowers() {
        towers = [[], [], []];
        for (let i = numDisks; i > 0; i--) {
            towers[startTower - 1].push(i);
        }
        currentMoveIndex = 0;
        isPlaying = false;
        clearTimeout(timeoutId);
        playPauseButton.textContent = 'Executar';
        nextButton.disabled = false;
        resetButton.disabled = false; 
        drawState(true); 
        updateMoveCounter();
        highlightMove(-1);
        if(movesListContainer) movesListContainer.style.display = 'none';
        if(showMovesButton) showMovesButton.textContent = 'Mostrar Movimentos';
    }

    function drawState(instant = false) {
        towers.forEach((tower, towerIndex) => {
            const towerElement = towersElement[towerIndex];
            if (!towerElement) return; // Segurança
            const towerBase = towerElement.querySelector('.base');
            if (!towerBase || !disksArea) return; // Segurança

            const towerRect = towerBase.getBoundingClientRect();
            const containerRect = disksArea.getBoundingClientRect();

            tower.forEach((diskId, diskIndex) => {
                const diskElement = diskElements[diskId - 1];
                if (diskElement) {
                    const left = towerRect.left - containerRect.left + (towerRect.width / 2) - (diskElement.offsetWidth / 2);
                    const bottom = towerBase.offsetHeight + (diskIndex * diskHeight);
                    diskElement.style.transition = instant ? 'none' : 'left 0.3s ease-in-out, bottom 0.3s ease-in-out';
                    diskElement.style.left = `${left}px`;
                    diskElement.style.bottom = `${bottom}px`;
                }
            });
        });
    }

    function performStep() {
        if (currentMoveIndex >= moves.length) {
            pause();
            return false;
        }

        const [source, destination] = moves[currentMoveIndex];
        const srcIndex = source - 1;
        const destIndex = destination - 1;

        if (towers[srcIndex].length > 0) {
            const diskId = towers[srcIndex].pop();
            towers[destIndex].push(diskId);

            highlightMove(currentMoveIndex);
            currentMoveIndex++;

            drawState();
            updateMoveCounter();
            return true;
        }
        return false;
    }

    function play() {
        if (isPlaying || currentMoveIndex >= moves.length) return;
        isPlaying = true;
        playPauseButton.textContent = 'Pausar';
        nextButton.disabled = true;
        resetButton.disabled = true;

        function loop() {
            if (isPlaying && performStep()) {
                const delay = 2100 - speedSlider.value;
                timeoutId = setTimeout(loop, delay);
            } else {
                pause();
            }
        }
        loop();
    }

    function pause() {
        isPlaying = false;
        clearTimeout(timeoutId);
        playPauseButton.textContent = 'Executar';
        nextButton.disabled = (currentMoveIndex >= moves.length);
        resetButton.disabled = false;
    }

    function next() {
        if (isPlaying) pause();
        performStep();
    }

    function reset() {
        pause();
        initializeTowers();
    }

    function updateMoveCounter() {
        if(moveCounter) moveCounter.textContent = `Passo: ${currentMoveIndex} / ${moves.length}`;
    }

    function highlightMove(index) {
        if (!movesListItems || movesListItems.length === 0) return;
        movesListItems.forEach(item => item.classList.remove('highlight'));
        if (index >= 0 && index < movesListItems.length) {
            movesListItems[index].classList.add('highlight');
            if (movesListContainer && movesListContainer.style.display !== 'none') {
                 movesListItems[index].scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        }
    }

    if(playPauseButton) playPauseButton.addEventListener('click', () => { isPlaying ? pause() : play(); });
    if(nextButton) nextButton.addEventListener('click', next);
    if(resetButton) resetButton.addEventListener('click', reset);
    if(showMovesButton) showMovesButton.addEventListener('click', () => {
        if(!movesListContainer) return;
        const isHidden = movesListContainer.style.display === 'none';
        movesListContainer.style.display = isHidden ? 'block' : 'none';
        showMovesButton.textContent = isHidden ? 'Esconder Movimentos' : 'Mostrar Movimentos';
    });
    window.addEventListener('resize', () => drawState(true));

    createDisks();
    initializeTowers();
});