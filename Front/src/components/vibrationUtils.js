// Também exporta o valor total para exibir se quiser
export function getVibrationTotal(vibX = 0, vibY = 0, vibZ = 0) {
  return Math.sqrt((vibX || 0) ** 2 + (vibY || 0) ** 2 + (vibZ || 0) ** 2);
}

// Função para avaliar vibração conforme classe de máquina
// vibTotal: valor RMS da vibração (mm/s)
// machineClass: string ('I', 'II', 'III', 'IV')
// Retorna: { rating: 'A'|'B'|'C'|'D', meaning: string }
export function getVibrationRatingByClass(vibTotal, machineClass) {
  const ranges = [
    {
      min: 0.18,
      max: 0.28,
      I: "A",
      II: "A",
      III: "A",
      IV: "A",
      meaning: "Bom",
    },
    {
      min: 0.28,
      max: 0.45,
      I: "A",
      II: "A",
      III: "A",
      IV: "A",
      meaning: "Bom/Satisfatório",
    },
    {
      min: 0.45,
      max: 0.71,
      I: "A",
      II: "A",
      III: "A",
      IV: "A",
      meaning: "Bom/Satisfatório/Insatisfatório",
    },
    {
      min: 0.71,
      max: 1.12,
      I: "B",
      II: "A",
      III: "A",
      IV: "A",
      meaning: "Bom/Satisfatório/Insatisfatório/Inaceitável",
    },
    {
      min: 1.12,
      max: 1.8,
      I: "B",
      II: "B",
      III: "A",
      IV: "A",
      meaning: "Satisfatório/Insatisfatório/Inaceitável",
    },
    {
      min: 1.8,
      max: 2.8,
      I: "C",
      II: "B",
      III: "B",
      IV: "A",
      meaning: "Insatisfatório/Inaceitável",
    },
    {
      min: 2.8,
      max: 4.5,
      I: "C",
      II: "C",
      III: "B",
      IV: "B",
      meaning: "Insatisfatório/Inaceitável",
    },
    {
      min: 4.5,
      max: 7.1,
      I: "D",
      II: "C",
      III: "C",
      IV: "B",
      meaning: "Inaceitável",
    },
    {
      min: 7.1,
      max: 11.2,
      I: "D",
      II: "D",
      III: "C",
      IV: "C",
      meaning: "Inaceitável",
    },
    {
      min: 11.2,
      max: 18,
      I: "D",
      II: "D",
      III: "D",
      IV: "C",
      meaning: "Inaceitável",
    },
    {
      min: 18,
      max: 28,
      I: "D",
      II: "D",
      III: "D",
      IV: "D",
      meaning: "Inaceitável",
    },
  ];
  for (const range of ranges) {
    if (vibTotal >= range.min && vibTotal < range.max) {
      const rating = range[machineClass];
      return { rating, meaning: range.meaning };
    }
  }
  // Fora da tabela: abaixo de 0.18 = A (Bom), acima de 28 = D (Inaceitável)
  if (vibTotal < 0.18) return { rating: "A", meaning: "Bom" };
  return { rating: "D", meaning: "Inaceitável" };
}
