import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';

import PortalHomePage from './page';

describe('portal home page', () => {
    it('renders the welcome message', () => {
        const html = renderToString(<PortalHomePage />);
        expect(html).toContain('Bienvenido al portal de tu mascota');
    });

    it('links to the pets and passport sub-routes', () => {
        const html = renderToString(<PortalHomePage />);
        expect(html).toContain('href="/portal/pets"');
        expect(html).toContain('href="/portal/passport"');
    });

    it('shows the preview disclaimer', () => {
        const html = renderToString(<PortalHomePage />);
        expect(html).toContain('vista preliminar');
        expect(html).toContain('funciones se habilitarán cuando el backend esté disponible');
    });
});
