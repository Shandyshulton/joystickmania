export interface User {
    id: number;
    nama: string;
    no_hp: string;
    email: string;
    email_verified_at?: string;
    membership_tier: string;
    is_admin: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
