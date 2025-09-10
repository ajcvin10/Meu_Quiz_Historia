// 1. Variáveis Globais e Referências aos Elementos HTML

let questions = []; // Array que armazenará as perguntas do nosso JSON
let currentQuestionIndex = 0; // Índice da pergunta atual
let score = 0; // Pontuação do jogador

// Selecionando os elementos HTML pelo ID para manipulá-los com JavaScript
const questionImage = document.getElementById('question-image');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackText = document.getElementById('feedback-text');
const explanationText = document.getElementById('explanation-text');
const nextButton = document.getElementById('next-button');
const currentScoreSpan = document.getElementById('current-score');
const totalQuestionsSpan = document.getElementById('total-questions');
const restartButton = document.getElementById('restart-button');
// Adicione estas duas linhas aqui
const gifAcertou = document.getElementById('gifAcertou');
const gifErrou = document.getElementById('gifErrou');

// Defina a duração que o GIF ficará visível (em milissegundos)
const DURACAO_GIF = 3000; // 3 segundos (esta variável não será mais usada para esconder o GIF automaticamente aqui)

// Função para esconder todos os GIFs (garante que apenas um apareça por vez)
function esconderTodosGifs() {
    gifAcertou.style.display = 'none';
    gifErrou.style.display = 'none';
}

// Função para mostrar um GIF específico (AGORA PERMANECE ATÉ ESCONDIDO POR OUTRA FUNÇÃO)
function mostrarGif(gifElemento) {
    // Primeiro, garanta que qualquer outro GIF esteja escondido
    esconderTodosGifs();

    // Mostra o GIF
    gifElemento.style.display = 'block';

    // *** CÓDIGO REMOVIDO/COMENTADO ABAIXO ***
    // // Esconde o GIF após a duração definida
    // setTimeout(() => {
    //     gifElemento.style.display = 'none';
    // }, DURACAO_GIF);
    // *** CÓDIGO REMOVIDO/COMENTADO ACIMA ***
}

// Funções auxiliares para serem chamadas facilmente
function mostrarGifAcertou() {
    mostrarGif(gifAcertou);
}

function mostrarGifErrou() {
    mostrarGif(gifErrou);
}

// 2. Função de Inicialização do Jogo

async function initGame() {
    try {
        // Carrega as perguntas do arquivo JSON
        // O 'await' faz o JavaScript esperar a resposta antes de continuar
        const response = await fetch('data/questions.json'); // Caminho atualizado para 'data/questions.json'
        questions = await response.json(); // Converte a resposta para JSON

        // Embaralha as perguntas para que a ordem mude a cada jogo
        shuffleArray(questions);

        // Define o total de perguntas no placar
        totalQuestionsSpan.textContent = questions.length;

        // Reinicia a pontuação e o índice da pergunta
        currentQuestionIndex = 0;
        score = 0;
        currentScoreSpan.textContent = score;

        // Esconde o botão de reiniciar no início
        restartButton.style.display = 'none';

        // Garante que nenhum GIF esteja visível ao iniciar o jogo
        esconderTodosGifs();

        // Carrega a primeira pergunta
        loadQuestion();
    } catch (error) {
        console.error('Erro ao carregar as perguntas:', error);
        questionText.textContent = 'Ocorreu um erro ao carregar o quiz. Por favor, tente novamente mais tarde.';
        optionsContainer.innerHTML = ''; // Limpa as opções
    }
}

// Função para embaralhar um array (algoritmo de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca elementos de lugar
    }
}

// 3. Função para Carregar e Exibir a Pergunta Atual

function loadQuestion() {
    // Esconde o feedback, explicação e o botão "Próxima Pergunta"
    feedbackText.textContent = '';
    explanationText.textContent = '';
    feedbackText.style.color = '#333'; // Reseta a cor do feedback
    nextButton.style.display = 'none';

    // Pega a pergunta atual do array
    const currentQuestion = questions[currentQuestionIndex];

    // Atualiza a imagem da pergunta (se houver)
    if (currentQuestion.imageName) {
        questionImage.src = `images/${currentQuestion.imageName}`;
        questionImage.style.display = 'block'; // Mostra a imagem
    } else {
        questionImage.style.display = 'none'; // Esconde se não houver imagem
    }

    // Atualiza o texto da pergunta
    questionText.textContent = currentQuestion.question;

    // Limpa o contêiner de opções antes de adicionar novas
    optionsContainer.innerHTML = '';

    // Cria um botão para cada opção de resposta
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button'); // Cria um elemento <button>
        button.textContent = option; // Define o texto do botão
        button.classList.add('option-button'); // Adiciona a classe CSS
        // Adiciona um 'ouvinte de evento' para quando o botão for clicado
        button.addEventListener('click', () => checkAnswer(option, button));
        optionsContainer.appendChild(button); // Adiciona o botão ao contêiner
    });
}

// 4. Função para Verificar a Resposta Selecionada

function checkAnswer(selectedOption, clickedButton) {
    // Desabilita todos os botões de opção para evitar múltiplos cliques
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true; // Desabilita o botão
    });

    const currentQuestion = questions[currentQuestionIndex];

    // *** LINHA CORRIGIDA AQUI: de 'currentOption.answer' para 'currentQuestion.answer' ***
    if (selectedOption === currentQuestion.answer) {
        score++; // Incrementa a pontuação se a resposta estiver correta
        currentScoreSpan.textContent = score; // Atualiza o placar no HTML
        feedbackText.textContent = 'Correto!';
        feedbackText.style.color = '#2ecc71'; // Verde para feedback correto
        clickedButton.classList.add('correct'); // Adiciona classe CSS para cor verde
        mostrarGifAcertou(); // <--- ADICIONADO PARA MOSTRAR O GIF DE ACERTO
    } else {
        feedbackText.textContent = 'Errado!';
        feedbackText.style.color = '#e74c3c'; // Vermelho para feedback errado
        clickedButton.classList.add('wrong'); // Adiciona classe CSS para cor vermelha

        // Encontra e destaca a resposta correta
        Array.from(optionsContainer.children).forEach(button => {
            if (button.textContent === currentQuestion.answer) {
                button.classList.add('correct');
            }
        });
        mostrarGifErrou(); // <--- ADICIONADO PARA MOSTRAR O GIF DE ERRO
    }

    // Exibe a explicação
    explanationText.textContent = currentQuestion.explanation;

    // Mostra o botão "Próxima Pergunta"
    nextButton.style.display = 'block';
}

// 5. Função para Avançar para a Próxima Pergunta

function nextQuestion() {
    currentQuestionIndex++; // Avança para o próximo índice de pergunta

    // Garante que os GIFs de feedback estejam escondidos antes da próxima pergunta
    esconderTodosGifs();

    if (currentQuestionIndex < questions.length) {
        loadQuestion(); // Carrega a próxima pergunta
    } else {
        endGame(); // Se todas as perguntas foram respondidas, termina o jogo
    }
}

// 6. Função para Finalizar o Jogo

function endGame() {
    questionText.textContent = `Fim do Quiz! Você acertou ${score} de ${questions.length} perguntas.`;
    optionsContainer.innerHTML = ''; // Limpa as opções
    feedbackText.textContent = 'Parabéns!';
    feedbackText.style.color = '#3498db'; // Azul para feedback final
    explanationText.textContent = ''; // Limpa a explicação
    nextButton.style.display = 'none'; // Esconde o botão de próxima pergunta
    restartButton.style.display = 'block'; // Mostra o botão de reiniciar
}

// 7. Função para Reiniciar o Jogo

function restartGame() {
    initGame(); // Chama a função de inicialização para reiniciar tudo
}

// 8. Adicionando os 'Ouvintes de Evento' aos Botões

// Quando o botão 'Próxima Pergunta' for clicado, chama a função nextQuestion
nextButton.addEventListener('click', nextQuestion);

// Quando o botão 'Reiniciar Jogo' for clicado, chama a função restartGame
restartButton.addEventListener('click', restartGame);

// 9. Inicia o Jogo Automaticamente quando a página é carregada
document.addEventListener('DOMContentLoaded', initGame);
