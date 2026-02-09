'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectCreatableProps {
    value?: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    createLabel?: (inputValue: string) => string;
    disabled?: boolean;
    className?: string;
}

/**
 * Select con capacidad de crear nuevas opciones escribiendo.
 * Basado en Combobox (Popover + Command + Input) con soporte para búsqueda y creación.
 */
export function SelectCreatable({
    value,
    onValueChange,
    options,
    placeholder = 'Selecciona una opción...',
    createLabel = (input) => `Crear: ${input}`,
    disabled = false,
    className,
}: SelectCreatableProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');

    // Encontrar la opción seleccionada
    const selectedOption = options.find((option) => option.value === value);

    // Filtrar opciones basado en búsqueda
    const filteredOptions = React.useMemo(() => {
        if (!searchValue) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [options, searchValue]);

    // Verificar si el valor de búsqueda es una opción nueva
    const isNewOption =
        searchValue.trim() !== '' &&
        !options.some(
            (option) => option.label.toLowerCase() === searchValue.toLowerCase()
        );

    const handleSelect = (selectedValue: string) => {
        onValueChange(selectedValue === value ? '' : selectedValue);
        setOpen(false);
        setSearchValue('');
    };

    const handleCreate = () => {
        if (isNewOption && searchValue.trim()) {
            onValueChange(searchValue.trim());
            setOpen(false);
            setSearchValue('');
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between',
                        !value && 'text-muted-foreground',
                        className
                    )}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar o escribir..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>
                            {isNewOption ? (
                                <div className="py-2 px-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={handleCreate}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {createLabel(searchValue)}
                                    </Button>
                                </div>
                            ) : (
                                'No se encontraron opciones.'
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === option.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                            {isNewOption && filteredOptions.length > 0 && (
                                <CommandItem
                                    value={searchValue}
                                    onSelect={handleCreate}
                                    className="border-t"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {createLabel(searchValue)}
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
