# BTP
code files and relevant things related to btp


# References

[ExacliDraw Road Map](https://excalidraw.com/#room=f5b932d66db926c2c44e,jdwk_7GHJ5otTKs64UHcUg)

## Dish Identification
- **[Food-101](https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/)**  
  Contains 101,000 images across 101 categories. This dataset is widely used for food recognition and will serve as the base for identifying dishes and their categories in the project.

- **[Recipe1M+](https://im2recipe.csail.mit.edu/)**  
  A large-scale dataset that pairs recipes with corresponding images. It helps in learning joint embeddings of text and images, which improves the accuracy and confidence of dish and cuisine identification.

## Food Quality
- **[Fresh and Spoiled Food Image Dataset (Kaggle)](https://www.kaggle.com/datasets/maheen00shahid/fresh-and-spoiled-food-image-dataset/data?select=dataset)**  
  A labeled dataset of fresh and spoiled food images. It will be used to train models that can distinguish between good and poor-quality food. Since it only contains images, the model will be trained using convolutional neural networks or hybrid vision architectures.  
  For cooked or prepared dishes, the dataset will be supplemented with additional curated examples and data augmentation to better capture real-world food quality conditions.
