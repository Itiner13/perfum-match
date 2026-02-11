export const surveyData = [
    { id: "name", question: "당신의 이름은 무엇인가요?", type: "text" },
    { id: "gender", question: "성별", type: "button", options: ["남", "여", "무관"] },
    { id: "age", question: "연령대", type: "button", options: ["10대", "20대", "30대", "40대", "50대 이상"] },
    { 
      id: "color", 
      question: "당신을 가장 잘 표현하는 색은?", 
      type: "visual-color", 
      options: [
        { text: "빨강", value: "#FF0000" },
        { text: "노랑", value: "#FFFF00" },
        { text: "초록", value: "#008000" },
        { text: "파랑", value: "#0000FF" },
        { text: "보라", value: "#800080" }
      ] 
    },
    { 
      id: "shape", 
      question: "당신의 내면과 가장 닮은 도형은?", 
      type: "visual-shape", 
      options: ["삼각형", "원형", "사각형"] 
    },
    { 
      id: "texture", 
      question: "나와 잘 어울리는 옷의 재질은?", 
      type: "visual-image", 
      options: ["리넨", "실크", "캐시미어 니트", "레더"] 
    },
    { 
      id: "sound", 
      question: "당신의 마음이 가장 안정되는 배경음은?", 
      type: "audio", 
      options: [
        { text: "새소리", src: "bird.mp3" },
        { text: "첼로", src: "cello.mp3" },
        { text: "백색소음(파도)", src: "wave.mp3" }
      ] 
    },
    { id: "impression", question: "타인에게 기억되고 싶은 당신의 인상은?", type: "button", options: ["산뜻하고 깨끗함", "지적이고 차분함", "매혹적이고 성숙함", "다정하고 포근함"] },
    { 
      id: "scent_like", 
      question: "평소 선호하는 향의 계열은? (최대 2개)", 
      type: "checkbox", 
      limit: 2, 
      options: ["시트러스", "플로럴", "우디", "머스크", "프루티", "스파이시", "그린", "마린", "모름(없음)"] 
    },
    { 
      id: "scent_dislike", 
      question: "절대 맡고 싶지 않은 향은? (최대 2개)", 
      type: "checkbox", 
      limit: 2, 
      options: ["독한 알코올", "인위적인 달콤함", "무겁고 텁텁함(절간 냄새)", "울렁거리는 꽃향", "없음"] 
    },
    { 
      id: "moment", 
      question: "이 향수를 사용할 순간은?", 
      type: "button-with-etc", 
      options: ["데일리(출근/등교)", "데이트 및 모임", "중요한 격식 자리", "혼자만의 휴식"],
      hasEtc: true
    },
    { id: "painpoint", question: "기존 향수에서 가장 아쉬웠던 점은?", type: "textarea", placeholder: "약한 지속력 / 너무 흔한 향 / 독한 첫 향 / 부담스러운 가격 등" }
  ];22