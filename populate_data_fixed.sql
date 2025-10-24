-- Insert packages
INSERT INTO packages (title, description, price) VALUES 
('Weekend Getaway', '2 nights accommodation with breakfast', 15000),
('Family Package', '3 nights with meals and activities', 25000),
('Honeymoon Special', 'Romantic getaway with spa treatment', 35000);

-- Insert services
INSERT INTO services (name, description, charges) VALUES 
('Spa Treatment', 'Relaxing spa and massage therapy', 2500),
('Swimming Pool', 'Access to resort swimming pool', 500),
('Gym Access', 'Fitness center and gym facilities', 800),
('Room Service', '24/7 room service and housekeeping', 1200),
('Airport Transfer', 'Pickup and drop from airport', 1500);

-- Insert food categories (without description column)
INSERT INTO food_categories (name) VALUES 
('Breakfast'),
('Lunch'),
('Dinner'),
('Beverages'),
('Snacks');

-- Insert food items
INSERT INTO food_items (name, description, price, available, category_id) VALUES 
('Continental Breakfast', 'Fresh bread, butter, jam, coffee, tea', 800, 'Yes', 1),
('Full English Breakfast', 'Eggs, bacon, sausage, toast, beans', 1200, 'Yes', 1),
('Grilled Chicken', 'Fresh grilled chicken with herbs', 1500, 'Yes', 2),
('Vegetable Curry', 'Mixed vegetable curry with rice', 900, 'Yes', 2),
('Fish Fry', 'Fresh fish with spices and lemon', 1800, 'Yes', 3),
('Pasta Carbonara', 'Creamy pasta with bacon and cheese', 1400, 'Yes', 3),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 300, 'Yes', 4),
('Coffee', 'Hot coffee with milk and sugar', 200, 'Yes', 4),
('Sandwich', 'Club sandwich with fries', 600, 'Yes', 5),
('Samosa', 'Crispy samosas with chutney', 150, 'Yes', 5);

-- Insert package images
INSERT INTO package_images (package_id, image_url) VALUES 
(1, '/static/packages/weekend.jpg'),
(2, '/static/packages/family.jpg'),
(3, '/static/packages/honeymoon.jpg');

-- Insert food item images
INSERT INTO food_item_images (item_id, image_url) VALUES 
(1, '/static/food_items/breakfast1.jpg'),
(2, '/static/food_items/breakfast2.jpg'),
(3, '/static/food_items/chicken.jpg'),
(4, '/static/food_items/curry.jpg'),
(5, '/static/food_items/fish.jpg'),
(6, '/static/food_items/pasta.jpg'),
(7, '/static/food_items/juice.jpg'),
(8, '/static/food_items/coffee.jpg'),
(9, '/static/food_items/sandwich.jpg'),
(10, '/static/food_items/samosa.jpg');
