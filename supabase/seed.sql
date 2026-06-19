-- Supabase Seed — Roofline Company
-- Run AFTER schema.sql and rls-policies.sql

-- Products (upsert by legacy_id to allow re-runs)
INSERT INTO products (slug, name, short_description, category, image_url, featured, active, display_order, legacy_id)
VALUES
  ('vinilo-blanco-brillante-para-impresion', 'Vinilo Blanco Brillante para Impresión', 'Interior y exterior. Alta adhesividad y cubrición. Apto para plotters eco-solvente.', 'vinilos', 'https://www.rooflinecompany.com/wp-content/uploads/2025/06/portadas-productos_Mesa-de-trabajo-1-copia-1018x1024.png', false, true, 0, 1),
  ('vinilo-blanco-mate-para-impresion', 'Vinilo Blanco Mate para Impresión', 'Acabado mate premium. Sin reflejos. Ideal para impresión interior de alta calidad.', 'vinilos', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-DE-IMPRESION.png', false, true, 10, 2),
  ('vinilo-transparente', 'Vinilo Transparente', 'Alta claridad óptica. Para ventanas, vidrios y aplicaciones especiales.', 'vinilos', 'https://www.rooflinecompany.com/wp-content/uploads/2025/06/portadas-productos_Mesa-de-trabajo-1-copia-1018x1024.png', false, true, 20, 3),
  ('vinilo-negro-mate', 'Vinilo Negro Mate', 'Alta cubrición. Sin reflejos. Para decoración y señalética de impacto.', 'vinilos', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-DE-IMPRESION.png', false, true, 30, 4),
  ('vinilo-adhesivo-de-corte', 'Vinilo Adhesivo de Corte', 'Para plotter de corte. Colores sólidos. Alta durabilidad en exterior.', 'vinilos', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-ADHESIVO.png', false, true, 40, 5),
  ('vinilo-magnetico', 'Vinilo Magnético', 'Para aplicaciones removibles sobre superficies metálicas. Vehículos y stands.', 'vinilos', 'https://www.rooflinecompany.com/wp-content/uploads/2025/06/portadas-productos_Mesa-de-trabajo-1-copia-2-1-1018x1024.png', false, true, 50, 6),
  ('vinilo-textil-para-prensa-de-calor', 'Vinilo Textil para Prensa de Calor', 'Transfer para tela. Colores vibrantes y alta elasticidad. Compatible con prensa de calor.', 'vinilos', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-ADHESIVO.png', false, true, 60, 7),
  ('tinta-eco-solvente-roland-dg', 'Tinta Eco-Solvente Roland DG', 'Compatible con Roland. Colores precisos y alta resistencia outdoor de 5+ años.', 'tintas', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-DE-IMPRESION.png', false, true, 70, 8),
  ('tinta-eco-solvente-mimaki', 'Tinta Eco-Solvente Mimaki', 'Compatible con Mimaki JV-series. Alta saturación y curado rápido.', 'tintas', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-DE-IMPRESION.png', false, true, 80, 9),
  ('tinta-eco-solvente-mutoh', 'Tinta Eco-Solvente Mutoh', 'Compatible con Mutoh ValueJet. Excelente definición de detalles finos.', 'tintas', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-DE-IMPRESION.png', false, true, 90, 10),
  ('tinta-uv-de-alta-resolucion', 'Tinta UV de Alta Resolución', 'Curado instantáneo por luz UV. Para sustratos rígidos y flexibles.', 'tintas', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-DE-IMPRESION.png', false, true, 100, 11),
  ('tinta-de-sublimacion', 'Tinta de Sublimación', 'Alta saturación y brillo. Para transfer textil e impresión en poliéster.', 'tintas', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/PAPEL-DE-SUBLIMACION.png', false, true, 110, 12),
  ('tinta-pigmentada-fine-art', 'Tinta Pigmentada Fine Art', 'Para papel fotográfico y fine art. Resistencia a UV de 100+ años.', 'tintas', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-DE-IMPRESION.png', false, true, 120, 13),
  ('plotter-de-corte-60cm', 'Plotter de Corte 60cm', 'Corte de precisión en vinilos, papel y cartón. Ideal para talleres pequeños.', 'maquinaria', 'https://www.rooflinecompany.com/wp-content/uploads/2022/05/PW-869x1024.png', false, true, 130, 14),
  ('plotter-de-corte-120cm', 'Plotter de Corte 120cm', 'Alto rendimiento. Corte de precisión en vinilos hasta 120cm de ancho.', 'maquinaria', 'https://www.rooflinecompany.com/wp-content/uploads/2022/05/PW-869x1024.png', false, true, 140, 15),
  ('impresora-eco-solvente-160m', 'Impresora Eco-Solvente 1.60m', 'Gran formato. Resolución 2880 DPI. Alta velocidad de producción.', 'maquinaria', 'https://www.rooflinecompany.com/wp-content/uploads/2022/05/PW-869x1024.png', false, true, 150, 16),
  ('impresora-uv-de-gran-formato', 'Impresora UV de Gran Formato', 'Impresión directa sobre rígidos. Curado UV instantáneo. Máxima calidad.', 'maquinaria', 'https://www.rooflinecompany.com/wp-content/uploads/2022/05/PW-869x1024.png', false, true, 160, 17),
  ('laminadora-de-rodillo-160m', 'Laminadora de Rodillo 1.60m', 'Laminado frío y caliente hasta 1.60m de ancho. Motor con regulación digital.', 'maquinaria', 'https://www.rooflinecompany.com/wp-content/uploads/2022/05/PW-869x1024.png', false, true, 170, 18),
  ('prensa-de-calor-plana-40x60cm', 'Prensa de Calor Plana 40x60cm', 'Temperatura y presión uniformes. Para telas, cerámica y objetos planos.', 'maquinaria', 'https://www.rooflinecompany.com/wp-content/uploads/2022/05/PW-869x1024.png', false, true, 180, 19),
  ('lona-publicitaria-front', 'Lona Publicitaria Front', 'Lona de alta calidad para impresión de alta resolución. Uso exterior.', 'banners', 'https://www.rooflinecompany.com/wp-content/uploads/2025/06/portadas-productos_Mesa-de-trabajo-1-1018x1024.png', false, true, 190, 20),
  ('lona-traslucida-para-caja-de-luz', 'Lona Traslúcida para Caja de Luz', 'Alta transmisión óptica uniforme. Para retroiluminación y cajas de luz.', 'banners', 'https://www.rooflinecompany.com/wp-content/uploads/2025/06/portadas-productos_Mesa-de-trabajo-1-1018x1024.png', false, true, 200, 21),
  ('lona-blackout-doble-cara', 'Lona Blackout Doble Cara', 'Sin trasluz. Ideal para impresión doble cara y señalética de alto tráfico.', 'banners', 'https://www.rooflinecompany.com/wp-content/uploads/2025/06/portadas-productos_Mesa-de-trabajo-1-1018x1024.png', false, true, 210, 22),
  ('lona-mesh-perforada', 'Lona Mesh Perforada', 'Transpira el viento. Para vallas publicitarias en exteriores de alta exposición.', 'banners', 'https://www.rooflinecompany.com/wp-content/uploads/2025/06/portadas-productos_Mesa-de-trabajo-1-1018x1024.png', false, true, 220, 23),
  ('papel-de-sublimacion-90gm', 'Papel de Sublimación 90g/m²', 'Alta retención de tinta. Para impresión en textiles de poliéster.', 'sublimacion', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/PAPEL-DE-SUBLIMACION.png', false, true, 230, 24),
  ('papel-de-sublimacion-tacky', 'Papel de Sublimación Tacky', 'Adhesivo temporal. Para tejidos elásticos y superficies irregulares.', 'sublimacion', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/PAPEL-DE-SUBLIMACION.png', false, true, 240, 25),
  ('prensa-de-calor-plana-50x70cm', 'Prensa de Calor Plana 50x70cm', 'Temperatura y presión uniformes. Para camisetas, tazas y objetos planos.', 'sublimacion', 'https://www.rooflinecompany.com/wp-content/uploads/2022/05/PW-869x1024.png', false, true, 250, 26),
  ('tinta-de-sublimacion-premium', 'Tinta de Sublimación Premium', 'Colores vibrantes y alta durabilidad. Compatible con Epson, Sawgrass.', 'sublimacion', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/PAPEL-DE-SUBLIMACION.png', false, true, 260, 27),
  ('vinilo-reflectivo-3m-serie-800', 'Vinilo Reflectivo 3M Serie 800', 'Retroreflexión tipo 2. Para señalización vial y seguridad industrial.', 'reflectivos', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/REFLECTIVOS.png', false, true, 270, 28),
  ('vinilo-reflectivo-economico-blanco', 'Vinilo Reflectivo Económico Blanco', 'Señalización básica exterior. Alta visibilidad nocturna. Precio accesible.', 'reflectivos', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/REFLECTIVOS.png', false, true, 280, 29),
  ('vinilo-reflectivo-amarillo', 'Vinilo Reflectivo Amarillo', 'Señalización vial y escolar. Alta retroreflexión.', 'reflectivos', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/REFLECTIVOS.png', false, true, 290, 30),
  ('vinilo-reflectivo-naranja', 'Vinilo Reflectivo Naranja', 'Para conos, barreras y seguridad en obra. Muy alta visibilidad.', 'reflectivos', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/REFLECTIVOS.png', false, true, 300, 31),
  ('polarizado-antirrayas-negro', 'Polarizado Antirrayas Negro', 'Alta resistencia a rayaduras. Para láminas de vehículos. 152cm x 60mts.', 'polarizado', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/POLARIZADO-ANTIRRAYAS-NEGRO-152-X-60MTS-1.jpg', false, true, 310, 32),
  ('polarizado-antirrayas-titanio', 'Polarizado Antirrayas Titanio', 'Efecto espejo exterior. Alta privacidad y protección UV. 152cm x 60mts.', 'polarizado', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/POLARIZADO-ANTIRRAYAS-TITANIO-152-X-60MTS.jpg', false, true, 320, 33),
  ('polarizado-antirrayas-grafito', 'Polarizado Antirrayas Grafito', 'Oscuro y sofisticado. Alta durabilidad y protección térmica.', 'polarizado', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/POLARIZADO-ANTIRRAYAS-GRAFITO-152-X-60MTS.jpg', false, true, 330, 34),
  ('polarizado-charcoal', 'Polarizado Charcoal', 'Tono oscuro premium. Para ventanas de vehículos y edificios.', 'polarizado', 'https://www.rooflinecompany.com/wp-content/uploads/2024/06/portada-polarizado_Mesa-de-trabajo-1_Mesa-de-trabajo-1_Mesa-de-trabajo-1-803x1024.png', false, true, 340, 35),
  ('vinilo-decorativo-para-interiores', 'Vinilo Decorativo para Interiores', 'Diseños exclusivos para decoración de interiores. Removible y repositionable.', 'decorativos', 'https://www.rooflinecompany.com/wp-content/uploads/2024/06/portada-decorativos_Mesa-de-trabajo-1-copia_Mesa-de-trabajo-1-copia-803x1024.png', false, true, 350, 36),
  ('vinilo-lenticular-3d', 'Vinilo Lenticular 3D', 'Efecto 3D y cambio de imagen. Para publicidad de alto impacto visual.', 'decorativos', 'https://www.rooflinecompany.com/wp-content/uploads/2024/07/lenticulares_Mesa-de-trabajo-1-copia-4-1024x1024.png', false, true, 360, 37),
  ('vinilo-esmerilado-para-vidrios', 'Vinilo Esmerilado para Vidrios', 'Efecto vidrio esmerilado para privacidad y decoración.', 'decorativos', 'https://www.rooflinecompany.com/wp-content/uploads/2024/06/portada-decorativos_Mesa-de-trabajo-1-copia_Mesa-de-trabajo-1-copia-803x1024.png', false, true, 370, 38),
  ('vinilo-lenticular-estandar', 'Vinilo Lenticular Estándar', 'Efecto 3D premium. Para señalización de alto impacto y publicidad.', 'lenticulares', 'https://www.rooflinecompany.com/wp-content/uploads/2024/07/lenticulares_Mesa-de-trabajo-1-copia-4-1024x1024.png', false, true, 380, 39),
  ('lenticular-flip-effect', 'Lenticular Flip Effect', 'Cambia de imagen según el ángulo. Gran formato hasta 1.60m.', 'lenticulares', 'https://www.rooflinecompany.com/wp-content/uploads/2024/07/lenticulares_Mesa-de-trabajo-1-copia-4-1024x1024.png', false, true, 390, 40),
  ('espatula-de-aplicacion-de-vinilo', 'Espátula de Aplicación de Vinilo', 'Para aplicación sin burbujas. Acabado profesional en vinilo y laminados.', 'herramientas', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-ADHESIVO.png', false, true, 400, 41),
  ('liquido-de-instalacion-vinilo', 'Líquido de Instalación Vinilo', 'Facilita el deslizamiento y reposición durante la aplicación.', 'herramientas', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-ADHESIVO.png', false, true, 410, 42),
  ('navaja-de-precision-con-repuestos', 'Navaja de Precisión con Repuestos', 'Para corte de vinilo y acabados. Cuchillas intercambiables.', 'herramientas', 'https://www.rooflinecompany.com/wp-content/uploads/2022/01/VINILO-ADHESIVO.png', false, true, 420, 43)
ON CONFLICT (legacy_id) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order;

-- Sections
INSERT INTO sections (key, title, description, visible, display_order)
VALUES
  ('hero', 'Hero / Cabecera', 'Título y subtítulo del catálogo', true, 0),
  ('featured', 'Productos Destacados', 'Selección de productos al inicio', true, 1),
  ('brands', 'Marcas', 'Logos de marcas que se manejan', true, 2),
  ('promotions', 'Promociones', 'Banners de descuentos y ofertas', false, 3),
  ('recommended_machines', 'Máquinas Recomendadas', 'Enlace a página de máquinas', true, 4),
  ('best_sellers', 'Más Consultados', 'Productos con mayor número de consultas', true, 5),
  ('contact_cta', 'CTA de Contacto', 'Bloque ¿No encuentras lo que buscas?', true, 6)
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  visible = EXCLUDED.visible,
  display_order = EXCLUDED.display_order;
