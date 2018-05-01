# comp20-s2018-team16

Project Name: Pantry
Problem Statement: people don’t know how to efficiently use the food in their fridge.

Solution:
Pantry is a user interface that checks a recipe database and a list of food already bought in order to produce a list of recipes.

Features:
This will be done by using a barcode scanner api called QuaggaJS, which is capable of using the user’s media to get direct access to the user’s camera stream. Quagga will decode the barcode and save the decoded barcode.

Once all the items have been scanned and decoded successfully, we will use a database to identify each item.

We will save the list as a json object
ingredients object
	array of ingredient objects
		key value pairs: 
			Name
			Quantity
				number
				unit
			Expiration

Ex:
{“ingredients”:
[{“Name”: “tomatoes”, “Quantity”: {“number”: 3, “unit”: “ct”}, “expiration”: “2015-02-03”},
{“Name”: “beef”, “Quantity”: {“number”: 1, “unit”: “lbs”}, “expiration”: “2015-02-03”}]
}

We will send the ingredients to the Food API by spoonacular.com this API will find recipes using the ingredients in the json object. It will return:
a list of recipes
-name of the recipe
-price of the recipe
-nutritional information

Data:
collecting barcode data

using database that links barcodes to ingredients

receiving name and expiration of ingredient
using recipe api
receiving name of the recipe, instructions of the recipe, nutritional information

Special Techniques:
barcode scanning
getting a database tufts dining/hodgdon

here's our wireframe:
https://go.gliffy.com/go/share/image/sguu4i3ts18d87l9m1rj.png?utm_medium=live-embed&utm_source=custom

## Comments by Ming
* No wireframes of the actual user interface / important screens provided.
* The general idea has been done before...
* ...but I really like the barcode scanning as that hasn't been done before.  That will make your project stand out.
* Talk to folks in team 5
