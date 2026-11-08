export interface DemoManga {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  genre: string;
  academicField: string;
  curriculumCode: string;
  coverImageUrl: string;
  bannerImageUrl: string;
  totalChapters: number;
}

export interface DemoPanel {
  panelId: string;
  panelIndex: number;
  aspectRatio: '9:16' | '1:1' | '16:9' | '3:4';
  renderedImageUrl: string;
  scenePrompt: string;
  balloons: {
    id: string;
    speakerName?: string;
    type: 'speech' | 'thought' | 'shout' | 'narration' | 'sfx';
    text: string;
    xPercent: number;
    yPercent: number;
    maxWidthPercent?: number;
    tailDirection?: 'none' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  }[];
  conceptMarkers: {
    id: string;
    conceptId: string;
    term: string;
    formulaLatex?: string;
    derivationSnippet: string;
    academicAnchor: string;
    xPercent: number;
    yPercent: number;
  }[];
}

export const DEMO_MANGA: DemoManga = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'The Quantum Hunter: Schrödinger’s Abyss',
  slug: 'quantum-hunter',
  synopsis: 'In Neo-Seoul Academy, high-tier students manipulate quantum probability wavefunctions as offensive magic relics to survive inter-dimensional breaches.',
  genre: 'sci_fi',
  academicField: 'Quantum Mechanics',
  curriculumCode: 'MIT 8.04',
  coverImageUrl: '/assets/covers/quantum-hunter.png',
  bannerImageUrl: '/assets/scenes/neo-seoul.png',
  totalChapters: 3,
};

export const DEMO_CHARACTERS = [
  {
    id: 'char-01',
    name: 'Jin Woo-Hyun',
    koreanName: '진우현',
    archetype: 'Grade S Quantum Hunter',
    avatarUrl: '/assets/characters/jin-woo-hyun.png',
    personality: 'Hyper-analytical prodigy who visualizes probability clouds in combat.',
    visualAttributes: {
      hair: 'Obsidian messy spikes with glowing cyan tips',
      eyes: 'Electric violet glowing iris',
      outfit: 'Carbon-weave tech-lab trenchcoat with kinetic energy dampeners',
    },
  },
  {
    id: 'char-02',
    name: 'Dr. Elena Han',
    koreanName: '한엘레나',
    archetype: 'Principal Quantum Investigator',
    avatarUrl: '/assets/characters/elena-han.png',
    personality: 'Methodical and sharp; mentors hunters in mathematical derivations.',
    visualAttributes: {
      hair: 'Platinum silver tied back neatly',
      eyes: 'Deep hazel with holographic optic scanner overlay',
      outfit: 'Sterile high-collar research uniform',
    },
  },
];

export const DEMO_PANELS: DemoPanel[] = [
  {
    panelId: 'pnl-01',
    panelIndex: 1,
    aspectRatio: '9:16',
    renderedImageUrl: '/assets/scenes/neo-seoul.png',
    scenePrompt: 'Wide panoramic establishing shot of Neo Seoul Academy at dusk, cyberpunk towers glowing with violet particle currents.',
    balloons: [
      {
        id: 'b-01',
        type: 'narration',
        text: 'Neo-Seoul Academy. Research Sub-Sector 7. The dimensional barrier boundary is oscillating.',
        xPercent: 50,
        yPercent: 18,
        maxWidthPercent: 65,
      },
    ],
    conceptMarkers: [
      {
        id: 'cm-01',
        conceptId: 'c-superposition',
        term: 'Quantum Superposition State',
        formulaLatex: '|\\Psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle, \\quad |\\alpha|^2 + |\\beta|^2 = 1',
        derivationSnippet: 'Any physical state can be represented as a linear combination of mutually orthogonal basis eigenstates.',
        academicAnchor: 'MIT 8.04 Lecture 1',
        xPercent: 82,
        yPercent: 12,
      },
    ],
  },
  {
    panelId: 'pnl-02',
    panelIndex: 2,
    aspectRatio: '9:16',
    renderedImageUrl: '/assets/panels/action-panel-1.png',
    scenePrompt: 'Intense close-up of Jin Woo-Hyun eyes blazing violet, cybernetic sigils materializing in the air as he unsheathes his quantum probability blade.',
    balloons: [
      {
        id: 'b-02',
        speakerName: 'Jin Woo-Hyun',
        type: 'speech',
        text: 'If the wavepacket collapses before we breach the dimensional seal, our entire strike unit decoheres!',
        xPercent: 36,
        yPercent: 22,
        maxWidthPercent: 55,
      },
      {
        id: 'b-03',
        type: 'sfx',
        text: 'VZZZZKT!!',
        xPercent: 78,
        yPercent: 48,
        maxWidthPercent: 30,
      },
    ],
    conceptMarkers: [
      {
        id: 'cm-02',
        conceptId: 'c-heisenberg',
        term: 'Heisenberg Uncertainty Principle',
        formulaLatex: '\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}',
        derivationSnippet: 'The fundamental limit to the precision with which certain pairs of physical properties of a particle can be known simultaneously.',
        academicAnchor: 'Griffiths Quantum Ch 3',
        xPercent: 84,
        yPercent: 20,
      },
    ],
  },
  {
    panelId: 'pnl-03',
    panelIndex: 3,
    aspectRatio: '9:16',
    renderedImageUrl: '/assets/characters/elena-han.png',
    scenePrompt: 'Dr. Elena Han monitoring holographic readouts, her optic scanner projecting differential equations.',
    balloons: [
      {
        id: 'b-04',
        speakerName: 'Dr. Elena Han',
        type: 'speech',
        text: 'Do not measure the eigenstate directly, Woo-Hyun! Hold the coherent phase until the Hamiltonian aligns!',
        xPercent: 40,
        yPercent: 20,
        maxWidthPercent: 58,
      },
      {
        id: 'b-05',
        type: 'narration',
        text: 'Measurement induces stochastic projection. You cannot undo a premature collapse.',
        xPercent: 50,
        yPercent: 85,
        maxWidthPercent: 60,
      },
    ],
    conceptMarkers: [
      {
        id: 'cm-03',
        conceptId: 'c-schrodinger',
        term: 'Time-Dependent Schrödinger Equation',
        formulaLatex: 'i\\hbar \\frac{\\partial}{\\partial t} |\\Psi(t)\\rangle = \\hat{H} |\\Psi(t)\\rangle',
        derivationSnippet: 'Governs the deterministic, unitary time evolution of isolated quantum wavefunctions.',
        academicAnchor: 'MIT 8.04 Lecture 4',
        xPercent: 80,
        yPercent: 15,
      },
    ],
  },
];

export const DEMO_QUIZ = {
  bossName: 'The Decoherence Colossus',
  bossMaxHp: 100,
  questions: [
    {
      id: 'q-01',
      conceptTitle: 'Heisenberg Uncertainty Limit',
      scenarioDialogue: 'The Colossus attempts to pin your exact position and momentum simultaneously inside the singularity field.',
      equationPrompt: '\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2}',
      options: [
        { id: 'opt-a', text: 'Compress momentum variance Δp to zero while keeping position uncertainty Δx finite.', isCorrect: false },
        { id: 'opt-b', text: 'Recognize that squeezing position variance Δx necessarily drives momentum variance Δp toward infinity.', isCorrect: true },
        { id: 'opt-c', text: 'Neutralize Planck\'s constant ℏ using an external magnetic field.', isCorrect: false },
        { id: 'opt-d', text: 'Collapse the wavepacket into a zero-volume point without energy cost.', isCorrect: false },
      ],
      explanation: 'According to the Robertson-Schrödinger relation, position and momentum are canonical conjugates. As uncertainty in one decreases, uncertainty in the other diverges inversely.',
    },
    {
      id: 'q-02',
      conceptTitle: 'Unitary Time Evolution',
      scenarioDialogue: 'An enemy disruption wave threatens to break probability conservation across the battlegrid.',
      equationPrompt: 'i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi',
      options: [
        { id: 'opt-a', text: 'Apply a non-Hermitian Hamiltonian to destroy the wavepacket.', isCorrect: false },
        { id: 'opt-b', text: 'Maintain a Hermitian Hamiltonian operator so that time evolution operator U(t) = exp(-iHt/ℏ) remains unitary.', isCorrect: true },
        { id: 'opt-c', text: 'Drop total probability from 1.0 to 0.5 to reduce enemy targeting.', isCorrect: false },
        { id: 'opt-d', text: 'Switch to classical trajectory physics to bypass Hilbert space.', isCorrect: false },
      ],
      explanation: 'Hermitian Hamiltonians ensure that probability amplitude sum remains exactly 1.0 at all times under unitary operator U(t).',
    },
  ],
};
