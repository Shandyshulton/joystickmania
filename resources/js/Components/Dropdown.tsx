import { Transition } from '@headlessui/react';
import { InertiaLinkProps, Link } from '@inertiajs/react';
import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useEffect,
    useId,
    useState,
} from 'react';

const DropDownContext = createContext<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
    contentId: string;
}>({
    open: false,
    setOpen: () => {},
    toggleOpen: () => {},
    contentId: '',
});

const Dropdown = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState(false);
    const contentId = useId();

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    // Escape menutup dropdown, sesuai perilaku standar disclosure
    useEffect(() => {
        if (!open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen, contentId }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({
    children,
    className = '',
}: PropsWithChildren<{ className?: string }>) => {
    const { open, setOpen, toggleOpen, contentId } = useContext(DropDownContext);

    return (
        <>
            <button
                type="button"
                onClick={toggleOpen}
                aria-expanded={open}
                aria-controls={contentId}
                className={className}
            >
                {children}
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-night-800 border border-night-600',
    children,
}: PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48';
    contentClasses?: string;
}>) => {
    const { open, setOpen, contentId } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    id={contentId}
                    className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-md ring-1 ring-black ring-opacity-5 ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({
    className = '',
    children,
    ...props
}: InertiaLinkProps) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-slate-300 transition duration-150 ease-in-out hover:bg-night-700 hover:text-neon-cyan focus:bg-night-700 focus:text-neon-cyan focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
