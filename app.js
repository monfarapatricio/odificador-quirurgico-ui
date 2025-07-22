const chatContainer = document.getElementById('chat-container');
let state = JSON.parse(localStorage.getItem('codificacionState')) || {};
let currentQuestionIndex = 0;
let questions = [];

fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    questions = data;
    renderNextQuestion();
  });

function renderNextQuestion() {
  if (currentQuestionIndex >= questions.length) return renderResult();
  const question = questions[currentQuestionIndex];
  const div = document.createElement('div');
  div.className = 'bubble';
  div.innerText = question.text;
  chatContainer.appendChild(div);

  if (question.type === 'buttons') {
    loadOptions(question).then(options => {
      options.forEach(option => {
        const btn = document.createElement('button');
        btn.innerText = option.label;
        btn.onclick = () => {
          saveAnswer(question.id, option.value);
          const userBubble = document.createElement('div');
          userBubble.className = 'bubble user';
          userBubble.innerText = option.label;
          chatContainer.appendChild(userBubble);
          currentQuestionIndex++;
          renderNextQuestion();
        };
        chatContainer.appendChild(btn);
      });
    });
  }
}

function saveAnswer(key, value) {
  state[key] = value;
  localStorage.setItem('codificacionState', JSON.stringify(state));
}

function loadOptions(question) {
  return fetch('nomenclador.json')
    .then(res => res.json())
    .then(data => {
      if (question.optionsSource === 'especialidades') {
        return Object.keys(data.especialidades).map(es => ({ label: es, value: es }));
      }
      if (question.optionsSource.includes('{especialidad}')) {
        const orgs = data.especialidades[state.especialidad].órganos;
        return Object.keys(orgs).map(o => ({ label: o, value: o }));
      }
      if (question.optionsSource.includes('{organo}')) {
        const procedimientos = data.especialidades[state.especialidad].órganos[state.organo];
        return procedimientos.map(p => ({
          label: p.descripcion,
          value: p.codigo
        }));
      }
    });
}

function renderResult() {
  const div = document.createElement('div');
  div.className = 'bubble';
  div.innerText = 'Código quirúrgico sugerido: ' + state.procedimiento;
  chatContainer.appendChild(div);
}