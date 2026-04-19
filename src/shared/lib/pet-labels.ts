import { PetSpecies } from '@nuvet/types';

const speciesLabels: Record<PetSpecies, string> = {
    [PetSpecies.DOG]: 'Perro',
    [PetSpecies.CAT]: 'Gato',
    [PetSpecies.BIRD]: 'Ave',
    [PetSpecies.RABBIT]: 'Conejo',
    [PetSpecies.HAMSTER]: 'Hamster',
    [PetSpecies.REPTILE]: 'Reptil',
    [PetSpecies.OTHER]: 'Otro',
};

export function getPetSpeciesLabel(species?: string | null): string {
    if (!species) return 'No registrada';
    return speciesLabels[species as PetSpecies] ?? species;
}
