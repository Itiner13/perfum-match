import { surveyData as questionsData } from './questions.js';
import { surveyData as weightsData } from './surveyData.js'; // Renamed to avoid conflict

let currentQuestionIndex = 0;
let userAnswers = []; // Stores the selected weights object (for select) or string (for text) for each question
let totalWeights = {};

const perfumeFamilies = ["시트러스", "그린", "플로럴", "우디", "머스크", "앰버", "워터리", "스파이시", "레더", "프루티"];

let landingPageContainer;
let startSurveyButton;
let questionText;
let optionsContainer;
let prevButton;
let nextButton;
let surveyContainer;
let resultsContainer;
let recommendationDisplay;
let restartButton;
let currentWeightsDisplay; // New: to display real-time weights

// --- Helper Mappings for question and option texts ---
// This maps questions.js question text to surveyData.js question text
const questionTextMap = {
  "당신을 가장 잘 표현하는 색은?": "[색채] 당신을 가장 잘 표현하는 색은?",
  "당신의 내면과 가장 닮은 도형은?": "[도형] 당신의 내면과 가장 닮은 도형은?",
  "나와 잘 어울리는 옷의 재질은?": "[질감] 나와 잘 어울리는 옷의 재질은?",
  "당신의 마음이 가장 안정되는 배경음은?": "[소리] 당신의 마음이 가장 안정되는 소리는?",
  "타인에게 기억되고 싶은 당신의 인상은?": "[이미지] 타인에게 남기고 싶은 당신의 인상은?"
};

// This maps questions.js option text to surveyData.js option text where they differ
const optionTextMap = {
  "빨강": "빨간색",
  "노랑": "노란색",
  "초록": "초록색",
  "파랑": "파란색",
  "보라": "보라색",
  "캐시미어 니트": "캐시미어",
  // Mappings for 'sound' question
  "새소리": "고음", // Assuming this mapping based on general tones
  "첼로": "저음", // Assuming this mapping based on general tones
  "백색소음(파도)": "백색소음",
  // Mappings for 'impression' question
  "산뜻하고 깨끗함": "산뜻/깨끗",
  "지적이고 차분함": "지적/차분",
  "매혹적이고 성숙함": "매혹/성숙",
  "다정하고 포근함": "다정/포근"
  // Add other mappings as needed if texts differ
};

function normalizeOptionText(text) {
  return optionTextMap[text] || text;
}
// --- End Helper Mappings ---


function initializeTotalWeights() {
  perfumeFamilies.forEach(family => {
    totalWeights[family] = 0;
  });
}

function updateRealtimeWeightsDisplay() {
  calculateTotalWeights(); // Recalculate weights based on current answers

  let weightsFormatted = Object.entries(totalWeights)
    .sort(([familyA], [familyB]) => perfumeFamilies.indexOf(familyA) - perfumeFamilies.indexOf(familyB)) // Sort by predefined order
    .map(([family, weight]) => `${family} ${weight}점`) // Format as "시트러스 n점"
    .join(', ');

  if (currentWeightsDisplay) {
    currentWeightsDisplay.textContent = weightsFormatted;
  }
}

function initializeSurvey() {
  console.log('initializeSurvey called'); // Debug log
  currentQuestionIndex = 0;
  userAnswers = new Array(questionsData.length).fill(null); // Initialize with null for each question
  initializeTotalWeights();

  surveyContainer.style.display = 'block';
  resultsContainer.style.display = 'none';
  renderQuestion();
  updateRealtimeWeightsDisplay(); // Display initial weights (all zero)
}

function renderQuestion() {
  console.log('renderQuestion called. Current index:', currentQuestionIndex); // Debug log
  const currentQuestion = questionsData[currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = ''; // Clear previous options

  const currentAnswer = userAnswers[currentQuestionIndex];

  switch (currentQuestion.type) {
    case 'text':
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = currentQuestion.placeholder || '여기에 입력하세요';
      textInput.classList.add('text-input');
      if (currentAnswer !== null) {
        textInput.value = currentAnswer;
      }
      textInput.addEventListener('input', (event) => {
        handleTextInput(event.target.value);
        updateRealtimeWeightsDisplay(); // Update on input change
      });
      optionsContainer.appendChild(textInput);
      break;

    case 'textarea':
      const textareaInput = document.createElement('textarea');
      textareaInput.placeholder = currentQuestion.placeholder || '여기에 작성하세요';
      textareaInput.classList.add('textarea-input');
      if (currentAnswer !== null) {
        textareaInput.value = currentAnswer;
      }
      textareaInput.addEventListener('input', (event) => {
        handleTextInput(event.target.value);
        updateRealtimeWeightsDisplay(); // Update on input change
      });
      optionsContainer.appendChild(textareaInput);
      break;

    case 'button':
    case 'visual-color':
    case 'visual-shape':
    case 'visual-image':
    case 'audio':
    case 'button-with-etc': // Added button-with-etc
      currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.classList.add('option-button');
        button.textContent = typeof option === 'object' && option.text ? option.text : option; // Handle options as objects or strings
        
        // Add visual specific classes or content here if needed
        if (currentQuestion.type === 'visual-color' && typeof option === 'object' && option.value) {
          button.style.backgroundColor = option.value;
          // Display text content along with the color
          button.textContent = option.text; 
          // You might want to add styling to make text visible against different background colors
          button.style.color = 'white'; // Example: ensure text is visible
          button.style.textShadow = '1px 1px 2px black'; // Example: ensure text is visible
        }
        // ... more visual/audio specific rendering logic ...

        button.addEventListener('click', () => {
          handleSelectOptionClick(option, index, currentQuestion.type === 'button-with-etc');
          updateRealtimeWeightsDisplay(); // Update on click
        });

        // Highlight if this option was previously selected
        if (currentAnswer !== null && !currentAnswer.isEtc && currentAnswer.optionIndex === index) {
          button.classList.add('selected');
        }
        optionsContainer.appendChild(button);
      });

      if (currentQuestion.type === 'button-with-etc' && currentQuestion.hasEtc) {
        const etcInputContainer = document.createElement('div');
        etcInputContainer.classList.add('etc-input-container');

        const etcInput = document.createElement('input');
        etcInput.type = 'text';
        etcInput.placeholder = '직접 입력';
        etcInput.classList.add('etc-input');
        etcInput.id = 'etc-input'; // Assign an ID for easier access

        // If 'etc' was previously selected and has a value, pre-populate
        if (currentAnswer && currentAnswer.isEtc && currentAnswer.value) {
          etcInput.value = currentAnswer.value;
        }

        etcInput.addEventListener('input', (event) => {
          handleEtcInput(event.target.value);
          updateRealtimeWeightsDisplay(); // Update on input change
        });
        
        optionsContainer.appendChild(etcInputContainer);
        etcInputContainer.appendChild(etcInput);
      }
      break;
    
    case 'checkbox':
      const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
      const isScentDislikeQuestion = (currentQuestion.id === 'scent_dislike');
      const isScentLikeQuestion = (currentQuestion.id === 'scent_like');
      const noneOptionValue = isScentDislikeQuestion ? '없음' : (isScentLikeQuestion ? '모름(없음)' : null);
      const noneOptionSelected = (isScentDislikeQuestion || isScentLikeQuestion) && selectedOptions.includes(noneOptionValue);

      currentQuestion.options.forEach((option, index) => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        const optionValue = typeof option === 'object' && option.text ? option.text : option;
        checkbox.value = optionValue;
        checkbox.checked = selectedOptions.includes(optionValue);
        
        // Disable other checkboxes if '없음'/'모름(없음)' is selected for respective questions
        if ((isScentDislikeQuestion || isScentLikeQuestion) && noneOptionSelected && optionValue !== noneOptionValue) {
          checkbox.disabled = true;
        }

        checkbox.addEventListener('change', (event) => {
          handleCheckboxChange(event.target.value, event.target.checked, currentQuestion.limit, currentQuestion.id);
          updateRealtimeWeightsDisplay(); // Update on change
        });
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(optionValue));
        optionsContainer.appendChild(label);
        optionsContainer.appendChild(document.createElement('br'));
      });
      break;

    default:
      console.warn('Unknown question type:', currentQuestion.type);
      break;
  }

  updateNavigationButtons();
}

function handleCheckboxChange(value, isChecked, limit, questionId) {
  let selectedOptions = Array.isArray(userAnswers[currentQuestionIndex]) ? [...userAnswers[currentQuestionIndex]] : [];

  const isScentDislikeQuestion = (questionId === 'scent_dislike');
  const isScentLikeQuestion = (questionId === 'scent_like');
  const noneOptionValue = isScentDislikeQuestion ? '없음' : (isScentLikeQuestion ? '모름(없음)' : null);


  if (isScentDislikeQuestion || isScentLikeQuestion) {
    if (value === noneOptionValue) {
      if (isChecked) {
        // If '없음'/'모름(없음)' is checked, uncheck and disable all other options
        selectedOptions = [noneOptionValue];
        const checkboxes = optionsContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
          if (cb.value !== noneOptionValue) {
            cb.checked = false;
            cb.disabled = true;
          }
        });
      } else {
        // If '없음'/'모름(없음)' is unchecked, re-enable all other options
        selectedOptions = [];
        const checkboxes = optionsContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
          cb.disabled = false;
        });
      }
    } else {
      // If another option is checked/unchecked
      if (isChecked) {
        // If another option is checked, uncheck '없음'/'모름(없음)' if it was selected
        selectedOptions = selectedOptions.filter(item => item !== noneOptionValue);
        const noneCheckbox = optionsContainer.querySelector(`input[value="${noneOptionValue}"]`);
        if (noneCheckbox) {
          noneCheckbox.checked = false;
        }

        // Apply limit for non-'없음'/'모름(없음)' options
        if (limit && selectedOptions.length >= limit) {
          event.target.checked = false;
          alert(`최대 ${limit}개까지 선택할 수 있습니다.`);
          return;
        }
        selectedOptions.push(value);
      } else {
        // If another option is unchecked
        selectedOptions = selectedOptions.filter(item => item !== value);
      }
    }
  } else {
    // Original limit logic for other checkbox questions
    if (isChecked) {
      if (limit && selectedOptions.length >= limit) {
        // If limit is reached, prevent checking more. Optionally, alert the user.
        event.target.checked = false; // Uncheck the one just clicked
        alert(`최대 ${limit}개까지 선택할 수 있습니다.`);
        return;
      }
      selectedOptions.push(value);
    } else {
      selectedOptions = selectedOptions.filter(item => item !== value);
    }
  }
  userAnswers[currentQuestionIndex] = selectedOptions;
  updateNavigationButtons();
}


function handleSelectOptionClick(option, optionIndex, isButtonWithEtc = false) {
  if (isButtonWithEtc) {
    // If an option button is clicked for 'button-with-etc', clear the etc input
    const etcInput = document.getElementById('etc-input');
    if (etcInput) etcInput.value = '';
    userAnswers[currentQuestionIndex] = { option: option, optionIndex: optionIndex, isEtc: false };
  } else {
    userAnswers[currentQuestionIndex] = { option: option, optionIndex: optionIndex }; // Store the full option and its index
  }
  renderQuestion(); // Re-render to update selected state and navigation
}

function handleTextInput(value) {
  userAnswers[currentQuestionIndex] = value;
  updateNavigationButtons(); // Update navigation buttons based on input
}

function handleEtcInput(value) {
  // Store etc input value, mark as 'isEtc'
  userAnswers[currentQuestionIndex] = { option: null, optionIndex: -1, isEtc: true, value: value };

  // Clear selected option buttons if etc is being used
  const buttons = optionsContainer.querySelectorAll('.option-button');
  buttons.forEach(button => button.classList.remove('selected'));
  updateNavigationButtons();
}

function updateNavigationButtons() {
  prevButton.disabled = currentQuestionIndex === 0;

  const currentQuestion = questionsData[currentQuestionIndex];
  let isAnswered = false;

  // Logic to determine if a question is answered based on its type
  const currentAnswer = userAnswers[currentQuestionIndex];
  if (currentQuestion.type === 'text' || currentQuestion.type === 'textarea') {
    isAnswered = currentAnswer !== null && currentAnswer.trim() !== '';
  } else if (currentQuestion.type === 'checkbox') {
    isAnswered = Array.isArray(currentAnswer) && currentAnswer.length > 0;
  } else if (currentQuestion.type === 'button-with-etc') {
    // Answered if an option button is selected OR etc input has a value
    isAnswered = (currentAnswer !== null && currentAnswer.optionIndex !== undefined && currentAnswer.optionIndex !== -1) ||
                 (currentAnswer !== null && currentAnswer.isEtc && currentAnswer.value && currentAnswer.value.trim() !== '');
  } else { // 'button', 'visual-color', 'visual-shape', 'visual-image', 'audio', 'select' (if it were still used)
    isAnswered = currentAnswer !== null;
  }

  nextButton.disabled = !isAnswered;
  nextButton.textContent = currentQuestionIndex === questionsData.length - 1 ? '결과 보기' : '다음';
}

function handleNextButton() {
  const currentQuestion = questionsData[currentQuestionIndex];
  let isAnswered = false;

  const currentAnswer = userAnswers[currentQuestionIndex];
  if (currentQuestion.type === 'text' || currentQuestion.type === 'textarea') {
    isAnswered = currentAnswer !== null && currentAnswer.trim() !== '';
  } else if (currentQuestion.type === 'checkbox') {
    isAnswered = Array.isArray(currentAnswer) && currentAnswer.length > 0;
  } else if (currentQuestion.type === 'button-with-etc') {
    isAnswered = (currentAnswer !== null && currentAnswer.optionIndex !== undefined && currentAnswer.optionIndex !== -1) ||
                 (currentAnswer !== null && currentAnswer.isEtc && currentAnswer.value && currentAnswer.value.trim() !== '');
  } else { // 'button', 'visual-color', 'visual-shape', 'visual-image', 'audio', 'select'
    isAnswered = currentAnswer !== null;
  }

  if (!isAnswered) {
    // alert('답변을 선택하거나 입력해주세요!'); // Removed as per user request
    return;
  }

  if (currentQuestionIndex < questionsData.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
    updateRealtimeWeightsDisplay(); // Update weights on navigation
  } else {
    showResults();
  }
}

function handlePrevButton() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
    updateRealtimeWeightsDisplay(); // Update weights on navigation
  }
}

function calculateTotalWeights() {
  initializeTotalWeights(); // Reset before recalculating

  userAnswers.forEach((answer, index) => {
    const questionInQuestions = questionsData[index]; // Question from questions.js
    
    // Attempt to map question text from questionsData to weightsData
    const mappedQuestionText = questionTextMap[questionInQuestions.question] || questionInQuestions.question;
    const questionInWeights = weightsData.find(q => q.question === mappedQuestionText);

    if (!questionInWeights || !questionInWeights.options) {
      // console.warn(`No matching weights data found for question: ${questionInQuestions.question}`);
      return; // Skip if no matching weights question
    }

    if (questionInQuestions.type === 'checkbox') {
      const selectedValues = Array.isArray(answer) ? answer : [];
      selectedValues.forEach(selectedValue => {
        // Apply +3 bonus for 'scent_like' question
        if (questionInQuestions.id === 'scent_like' && selectedValue !== '모름(없음)') {
          if (totalWeights.hasOwnProperty(selectedValue)) {
            totalWeights[selectedValue] += 3;
          }
        }

        const normalizedSelectedValue = normalizeOptionText(selectedValue);
        const optionInWeights = questionInWeights.options.find(opt => opt.text === normalizedSelectedValue);
        if (optionInWeights && optionInWeights.weights) {
          for (const family in optionInWeights.weights) {
            if (totalWeights.hasOwnProperty(family)) {
              totalWeights[family] += optionInWeights.weights[family];
            }
          }
        }
      });
    } else if (answer && answer.optionIndex !== undefined && answer.optionIndex !== -1) {
      // For 'button', 'visual-color', etc. where a single option button is selected
      const selectedOptionInQuestions = questionInQuestions.options[answer.optionIndex];
      const selectedOptionText = typeof selectedOptionInQuestions === 'object' && selectedOptionInQuestions.text ? selectedOptionInQuestions.text : selectedOptionInQuestions;
      
      const normalizedSelectedOptionText = normalizeOptionText(selectedOptionText);
      const optionInWeights = questionInWeights.options.find(opt => opt.text === normalizedSelectedOptionText);
      
      if (optionInWeights && optionInWeights.weights) {
        for (const family in optionInWeights.weights) {
          if (totalWeights.hasOwnProperty(family)) {
            totalWeights[family] += optionInWeights.weights[family];
          }
        }
      }
    } else if (questionInQuestions.type === 'button-with-etc' && answer && answer.isEtc && answer.value && answer.value.trim() !== '') {
      // If 'etc' input was used for 'button-with-etc' type, we need weights for 'etc'.
      // For now, no specific weights are defined for 'etc' in weightsData.
      // This would require a decision on how 'etc' input impacts weights.
      // For this iteration, 'etc' input will not contribute to weights.
    }
  });
}


function showResults() {
  calculateTotalWeights();

  let maxWeight = -Infinity;
  let recommendedFamily = '';

  for (const family in totalWeights) {
    if (totalWeights[family] > maxWeight) {
      maxWeight = totalWeights[family];
      recommendedFamily = family;
    }
  }

  // Display user's name if collected
  // Assuming the first question with id 'name' is for the user's name
  const nameQuestion = questionsData.find(q => q.id === 'name');
  const nameQuestionIndex = questionsData.indexOf(nameQuestion);
  const userName = (nameQuestion && userAnswers[nameQuestionIndex] && userAnswers[nameQuestionIndex].trim() !== '') ? userAnswers[nameQuestionIndex] : '';

  // Improved display for recommendation and weights
  let weightsDisplay = Object.entries(totalWeights)
    .sort(([familyA], [familyB]) => perfumeFamilies.indexOf(familyA) - perfumeFamilies.indexOf(familyB)) // Sort by predefined order
    .map(([family, weight]) => `${family} ${weight}점`) // Format as "시트러스 n점"
    .join(', ');


  recommendationDisplay.innerHTML = `
    <h2>${userName}님께 추천하는 향수</h2>
    <p><strong>"THE NUDE"</strong></p>
    <h3>향조별 가중치 합계:</h3>
    <p>${weightsDisplay}</p>
  `;
  
  surveyContainer.style.display = 'none';
  resultsContainer.style.display = 'block';
}

// Initialize the display and event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  landingPageContainer = document.getElementById('landing-page-container');
  startSurveyButton = document.getElementById('start-survey-button');
  questionText = document.getElementById('question-text');
  optionsContainer = document.getElementById('options-container');
  prevButton = document.getElementById('prev-button');
  nextButton = document.getElementById('next-button');
  surveyContainer = document.getElementById('survey-container');
  resultsContainer = document.getElementById('results-container');
  recommendationDisplay = document.getElementById('recommendation-display');
  restartButton = document.getElementById('restart-button');
  currentWeightsDisplay = document.getElementById('current-weights'); // New: Get the real-time display element

  // Event Listeners
  nextButton.addEventListener('click', handleNextButton);
  prevButton.addEventListener('click', handlePrevButton);
  restartButton.addEventListener('click', initializeSurvey);

  startSurveyButton.addEventListener('click', () => {
    console.log('startSurveyButton clicked'); // Debug log
    landingPageContainer.style.display = 'none';
    initializeSurvey();
  });

  landingPageContainer.style.display = 'block';
  resultsContainer.style.display = 'none';
});
