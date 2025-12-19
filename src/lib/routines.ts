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
  colorClass: string;
  bgGradient: string;
  routines: SectionRoutine;
}

// Face section has day-specific evening routines
export const faceSection: RoutineSection = {
  id: 'face',
  title: 'Face',
  icon: '✨',
  colorClass: 'text-rose-400',
  bgGradient: 'from-rose-500/20 to-pink-500/10',
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
  id: 'oral',
  title: 'Orals',
  icon: '💊',
  colorClass: 'text-amber-400',
  bgGradient: 'from-amber-500/20 to-orange-500/10',
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
  colorClass: 'text-teal-400',
  bgGradient: 'from-teal-500/20 to-cyan-500/10',
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

export function getEveningRoutineForDay(section: RoutineSection, day: DayOfWeek): Routine | null {
  const evening = section.routines.evening;
  
  if (Array.isArray(evening)) {
    return evening.find(routine => routine.daysApplicable?.includes(day)) || null;
  }
  
  return evening;
}

