import { sql } from "../config/db.js";

export const getProducts = async (req, res) => {
    try {
        const products = await sql`
            SELECT * FROM products
            ORDER BY created_at DESC
        `;
        console.log("Fetched products", products);
        res.status(200).json({success: true, data: products});
    } catch (e){
        console.error("Failed to fetch products", e);
        res.status(500).json({success: false, message: "Failed to fetch products"});
    }
};

export const createProduct = async (req, res) => {
    const { name, image, price } = req.body;

    if (!name || !image || !price) {
        return res.status(400).json({success: false, message: "Please provide all fields"});
    }

    try {
        const newProduct = await sql`
            INSERT INTO products (name, price, image)
            VALUES (${name}, ${price}, ${image})
            RETURNING *
        `;
        
        res.status(201).json({success: true, data: newProduct[0]});
    } catch (e) {
        console.error("Failed to create product", e);
        res.status(500).json({success: false, message: "Failed to create product"});
    }
};

export const getProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await sql`
            SELECT * FROM products
            WHERE id = ${id}
        `;
        
        res.status(200).json({success: true, data: product[0]});
    } catch (e) {
        console.error("Failed to fetch product", e);
        res.status(500).json({success: false, message: "Failed to fetch product"});
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, image, price } = req.body;

    if (!name || !image || !price) {
        return res.status(400).json({success: false, message: "Please provide all fields"});
    }

    try {
        const updatedProduct = await sql`
            UPDATE products
            SET name = ${name}, price = ${price}, image = ${image}
            WHERE id = ${id}
            RETURNING *
        `;

        if(updateProduct.length === 0) {
            return res.status(404).json({success: false, message: "Product not found"});
        }

        res.status(200).json({success: true, data: updatedProduct[0]});
    } catch (e) {
        console.error("Failed to update product", e);
        res.status(500).json({success: false, message: "Failed to update product"});
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await sql`
            DELETE FROM products
            WHERE id = ${id}
            RETURNING *
        `;

        if(deletedProduct.length === 0) {
            return res.status(404).json({success: false, message: "Product not found"});
        }

        res.status(200).json({success: true, data: deletedProduct[0]});
    } catch (e) {
        console.error("Failed to delete product", e);
        res.status(500).json({success: false, message: "Failed to delete product"});
    }
};