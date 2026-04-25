import csv
import random

# Configuration
NUM_ENTRIES = 10000
LOCATIONS = ['Mumbai, MH', 'Delhi, DL', 'Bangalore, KA', 'Hyderabad, TS', 'Chennai, TN', 'Pune, MH', 'Kolkata, WB', 'Ahmedabad, GJ']
TYPES = ['Apartment', 'Villa', 'Condo', 'Penthouse', 'Townhouse']
AMENITIES_LIST = ['Pool', 'Gym', 'Parking', 'WiFi', 'Garden', 'Security']

def generate_dataset(filename):
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['title', 'location', 'type', 'area', 'bedrooms', 'bathrooms', 'yearBuilt', 'amenities', 'price']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for i in range(NUM_ENTRIES):
            prop_type = random.choice(TYPES)
            location = random.choice(LOCATIONS)
            area = random.randint(500, 5000)
            bedrooms = random.randint(1, 6)
            bathrooms = random.randint(1, 4)
            yearBuilt = random.randint(1980, 2024)
            
            # Base price logic
            price = (area * 300) + (bedrooms * 50000) + (bathrooms * 20000)
            if prop_type == 'Villa': price *= 1.5
            if prop_type == 'Penthouse': price *= 2.0
            if 'Mumbai' in location: price *= 2.0
            if 'Delhi' in location: price *= 1.8
            if 'Bangalore' in location: price *= 1.5
            
            # Randomize price a bit
            price = int(price * random.uniform(0.9, 1.1))

            num_amenities = random.randint(1, 5)
            amenities = ",".join(random.sample(AMENITIES_LIST, num_amenities))

            writer.writerow({
                'title': f"Premium {prop_type} in {location.split(',')[0]}",
                'location': location,
                'type': prop_type,
                'area': area,
                'bedrooms': bedrooms,
                'bathrooms': bathrooms,
                'yearBuilt': yearBuilt,
                'amenities': amenities,
                'price': price
            })

if __name__ == "__main__":
    generate_dataset('properties_dataset_india.csv')
    print("Dataset generated: 10,000 entries created (Indian Cities).")
