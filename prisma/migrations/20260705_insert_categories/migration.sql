-- Insert categories
INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'Mocasines',
    'mocasines',
    'Calzado clásico y sofisticado, diseñado para brindar elegancia, comodidad y versatilidad en cualquier ocasión, desde reuniones de negocios hasta eventos casuales.',
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Apache',
    'apache',
    'Zapatos de inspiración artesanal con acabados robustos y un estilo tradicional. Ideales para quienes buscan comodidad, durabilidad y un look auténtico.',
    2,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Sneaker',
    'sneakers',
    'Tenis de diseño moderno que combinan moda, confort y rendimiento. Perfectos para el uso diario y para complementar un estilo urbano y contemporáneo.',
    3,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Botas',
    'botas',
    'Calzado de caña alta elaborado para ofrecer mayor protección, resistencia y estilo. Una excelente opción para climas fríos, actividades al aire libre o un look imponente.',
    4,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Sport',
    'sport',
    'Calzado deportivo ligero y ergonómico, pensado para brindar comodidad durante caminatas, entrenamientos y el uso cotidiano con un estilo dinámico.',
    5,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Oxford',
    'oxford',
    'Zapatos de vestir con diseño clásico de cordones y acabado refinado. La elección ideal para ocasiones formales, ambientes ejecutivos y eventos especiales.',
    6,
    true,
    NOW(),
    NOW()
  );
