export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Product {
  name: string;
  id: string;
}

export interface Routine {
  products: Product[];
  daysApplicable?: DayOfWeek[]; // If undefined, applies every day
}

export interface SectionRoutine {
  morning: Routine;
  evening: Routine | Routine[]; // Array for day-specific routines
}

export interface RoutineSection {
  id: string;
  title: string;
  icon: string;
  accentColor: 'rose' | 'teal' | 'amber';
  routines: SectionRoutine;
}

// Face section has day-specific evening routines
export const faceSection: RoutineSection = {
  id: 'face',
  title: 'Face',
  icon: '✨',
  accentColor: 'rose',
  routines: {
    morning: {
      products: [
        { name: 'Azelaq', id: 'azelaq' },
        { name: 'Nioclean', id: 'nioclean' },
      ],
    },
    evening: [
      {
        products: [
          { name: 'Iloderm', id: 'iloderm' },
          { name: 'Glycoa', id: 'glycoa' },
          { name: 'Nioclean', id: 'nioclean' },
        ],
        daysApplicable: ['monday', 'wednesday', 'friday', 'sunday'],
      },
      {
        products: [
          { name: 'Exfol', id: 'exfol' },
          { name: 'Glycoa', id: 'glycoa' },
          { name: 'Nioclean', id: 'nioclean' },
        ],
        daysApplicable: ['tuesday', 'thursday', 'saturday'],
      },
    ],
  },
};

export const oralSection: RoutineSection = {
  id: 'orals',
  title: 'Orals',
  icon: '💊',
  accentColor: 'amber',
  routines: {
    morning: {
      products: [
        { name: 'Iraltone', id: 'iraltone-am' },
      ],
    },
    evening: {
      products: [
        { name: 'Doxy', id: 'doxy' },
        { name: 'Minoxidil', id: 'minoxidil-oral' },
        { name: 'Stercia', id: 'stercia' },
        { name: 'Iraltone', id: 'iraltone-pm' },
        { name: 'Skizin', id: 'skizin' },
      ],
    },
  },
};

export const scalpSection: RoutineSection = {
  id: 'scalp',
  title: 'Scalp',
  icon: '💆',
  accentColor: 'teal',
  routines: {
    morning: {
      products: [
        { name: 'Soapfree', id: 'soapfree-am' },
        { name: 'Seskavel', id: 'seskavel-am' },
        { name: 'Minoxidil', id: 'minoxidil-am' },
      ],
    },
    evening: {
      products: [
        { name: 'Soapfree', id: 'soapfree-pm' },
        { name: 'Seskavel', id: 'seskavel-pm' },
        { name: 'Minoxidil', id: 'minoxidil-pm' },
      ],
    },
  },
};

export const allSections: RoutineSection[] = [faceSection, scalpSection, oralSection];

export function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export function getDayAbbreviation(day: DayOfWeek): string {
  const abbrevs: Record<DayOfWeek, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };
  return abbrevs[day];
}

const daysOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function getPreviousDay(day: DayOfWeek): DayOfWeek {
  const index = daysOrder.indexOf(day);
  return daysOrder[(index - 1 + 7) % 7];
}

export function getNextDay(day: DayOfWeek): DayOfWeek {
  const index = daysOrder.indexOf(day);
  return daysOrder[(index + 1) % 7];
}

export function getEveningRoutineForDay(section: RoutineSection, day: DayOfWeek): Routine | null {
  const evening = section.routines.evening;
  
  if (Array.isArray(evening)) {
    return evening.find(routine => routine.daysApplicable?.includes(day)) || null;
  }
  
  return evening;
}
