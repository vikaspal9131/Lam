const phrases = [
    "Enter a URL...",
    "Paste your link here...",
    "Type something amazing...",
    "Drop your website link...",
  ];

  const input = document.getElementById("urlInput");
  let currentPhraseIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentPhrase = phrases[currentPhraseIndex];
    if (isDeleting) {
      currentCharIndex--;
    } else {
      currentCharIndex++;
    }

    const updatedText = currentPhrase.substring(0, currentCharIndex);
    input.setAttribute("placeholder", updatedText);

    if (!isDeleting && currentCharIndex === currentPhrase.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1500); 
    } else if (isDeleting && currentCharIndex === 0) {
      isDeleting = false;
      currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
      setTimeout(typeEffect, 500); 
    } else {
      setTimeout(typeEffect, isDeleting ? 10 : 10);
    }
  }

  typeEffect();





document.getElementById('summaryForm').addEventListener('submit', async function(e) {
  e.preventDefault();


  const url = document.getElementById('urlInput').value;

  const response = await fetch('/api/summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ url: url })
  });

  const data = await response.json();

 
  const outputBox = document.getElementById('output');
  outputBox.classList.remove('hidden');

  document.getElementById('summary').textContent = data.summary || "No summary.";


  const keyPointsList = document.getElementById('keyPoints');
  keyPointsList.innerHTML = '';
  if (data.key_points) {
    data.key_points.forEach(point => {
      const li = document.createElement('li');
      li.textContent = point;
      keyPointsList.appendChild(li);
    });
  }


  const codeDiv = document.getElementById('codeExplanations');
  codeDiv.innerHTML = '';
  if (data.code_explanation) {
    data.code_explanation.forEach(block => {
      const codeBlock = document.createElement('pre');
      codeBlock.textContent = block.code;

      const explanation = document.createElement('p');
      explanation.textContent = block.explanation;

      codeDiv.appendChild(codeBlock);
      codeDiv.appendChild(explanation);
    });
  }

  if (data.error) {
    alert(data.error);
    outputBox.classList.add('hidden'); 
  }
});
