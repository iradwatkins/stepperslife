#!/bin/bash

# Update restaurants spec
sed -i 's/DATABASE_URL="postgresql:\/\/user:password@localhost:5432\/stepperslife"/DATABASE_URL="postgresql:\/\/user:password@localhost:5432\/stepperslife_restaurants"/' stepperslife-restaurant-spec.md
sed -i 's/MINIO_PORT=9000/MINIO_PORT=9001/' stepperslife-restaurant-spec.md
sed -i 's/MINIO_ACCESS_KEY="minioadmin"/MINIO_ACCESS_KEY="restaurants_minio"/' stepperslife-restaurant-spec.md
sed -i 's/MINIO_SECRET_KEY="minioadmin"/MINIO_SECRET_KEY="restaurants_secret"/' stepperslife-restaurant-spec.md
sed -i '/MINIO_USE_SSL=false/a\MINIO_BUCKET_NAME="restaurants"' stepperslife-restaurant-spec.md

# Update events spec  
sed -i 's/DATABASE_URL="postgresql:\/\/user:password@localhost:5432\/stepperslife"/DATABASE_URL="postgresql:\/\/user:password@localhost:5433\/stepperslife_events"/' stepperslife-events-spec.md
sed -i 's/MINIO_PORT=9000/MINIO_PORT=9002/' stepperslife-events-spec.md
sed -i 's/MINIO_ACCESS_KEY="minioadmin"/MINIO_ACCESS_KEY="events_minio"/' stepperslife-events-spec.md
sed -i 's/MINIO_SECRET_KEY="minioadmin"/MINIO_SECRET_KEY="events_secret"/' stepperslife-events-spec.md
sed -i '/MINIO_USE_SSL=false/a\MINIO_BUCKET_NAME="events"' stepperslife-events-spec.md

# Update store spec
sed -i 's/DATABASE_URL="postgresql:\/\/user:password@localhost:5432\/stepperslife"/DATABASE_URL="postgresql:\/\/user:password@localhost:5434\/stepperslife_store"/' stepperslife-store-spec.md
sed -i 's/MINIO_PORT=9000/MINIO_PORT=9003/' stepperslife-store-spec.md
sed -i 's/MINIO_ACCESS_KEY="minioadmin"/MINIO_ACCESS_KEY="store_minio"/' stepperslife-store-spec.md
sed -i 's/MINIO_SECRET_KEY="minioadmin"/MINIO_SECRET_KEY="store_secret"/' stepperslife-store-spec.md
sed -i '/MINIO_USE_SSL=false/a\MINIO_BUCKET_NAME="store"' stepperslife-store-spec.md

# Update classes spec
sed -i 's/DATABASE_URL="postgresql:\/\/user:password@localhost:5432\/stepperslife"/DATABASE_URL="postgresql:\/\/user:password@localhost:5435\/stepperslife_classes"/' stepperslife-classes-spec.md
sed -i 's/MINIO_PORT=9000/MINIO_PORT=9004/' stepperslife-classes-spec.md
sed -i 's/MINIO_ACCESS_KEY="minioadmin"/MINIO_ACCESS_KEY="classes_minio"/' stepperslife-classes-spec.md
sed -i 's/MINIO_SECRET_KEY="minioadmin"/MINIO_SECRET_KEY="classes_secret"/' stepperslife-classes-spec.md
sed -i '/MINIO_USE_SSL=false/a\MINIO_BUCKET_NAME="classes"' stepperslife-classes-spec.md

# Update magazine spec
sed -i 's/DATABASE_URL="postgresql:\/\/user:password@localhost:5432\/stepperslife"/DATABASE_URL="postgresql:\/\/user:password@localhost:5436\/stepperslife_magazine"/' stepperslife-magazine-spec.md
sed -i 's/MINIO_PORT=9000/MINIO_PORT=9005/' stepperslife-magazine-spec.md
sed -i 's/MINIO_ACCESS_KEY="minioadmin"/MINIO_ACCESS_KEY="magazine_minio"/' stepperslife-magazine-spec.md
sed -i 's/MINIO_SECRET_KEY="minioadmin"/MINIO_SECRET_KEY="magazine_secret"/' stepperslife-magazine-spec.md
sed -i '/MINIO_USE_SSL=false/a\MINIO_BUCKET_NAME="magazine"' stepperslife-magazine-spec.md

# Update services spec
sed -i 's/DATABASE_URL="postgresql:\/\/user:password@localhost:5432\/stepperslife"/DATABASE_URL="postgresql:\/\/user:password@localhost:5437\/stepperslife_services"/' stepperslife-services-spec.md
sed -i 's/MINIO_PORT=9000/MINIO_PORT=9006/' stepperslife-services-spec.md
sed -i 's/MINIO_ACCESS_KEY="minioadmin"/MINIO_ACCESS_KEY="services_minio"/' stepperslife-services-spec.md
sed -i 's/MINIO_SECRET_KEY="minioadmin"/MINIO_SECRET_KEY="services_secret"/' stepperslife-services-spec.md
sed -i '/MINIO_USE_SSL=false/a\MINIO_BUCKET_NAME="services"' stepperslife-services-spec.md

echo "All specs updated with isolated resources!"
