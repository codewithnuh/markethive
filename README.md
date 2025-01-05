
---

# **MarketHive**

Welcome to **MarketHive**, your go-to e-commerce platform for laptops and mobile devices. MarketHive is built with cutting-edge technologies to deliver a seamless shopping experience, a modern UI, and powerful admin tools.

---

## **Features**

### **Customer-Facing Features**
- 🚀 **Dynamic Discounts**: Real-time promotional banners showcasing the best deals.  
- 🛒 **Interactive Cart Sidebar**: Add, update, or remove items without leaving the page.  
- 🌗 **Dark Mode Support**: Toggle between light and dark modes for a personalized experience.  
- 📱 **Mobile-Friendly Design**: Fully responsive layouts for all devices.  
- 🔍 **Explore Collections**: Browse the latest and best-selling laptops and mobile devices.

### **Admin-Facing Features**
- 🧠 **AI-Powered Product Enhancement**:  
  Use AI to auto-generate compelling titles and descriptions for products.
- 🛠️ **Effortless Product Management**: Add, update, and delete products with an intuitive interface.

---

## **Tech Stack**

### **Frontend**
- **Next.js 15**  
- **React 19**  
- **TailwindCSS**  
- **shadcn/ui**  

### **Backend**
- **PostgreSQL** (Database)  
- **Prisma ORM** (Database ORM)  
- **Zod** (Schema validation)  

### **Other Tools**
- **React Hook Form** (Form handling)  
- **UploadThing** (File uploads)  

---

## **Getting Started**

Follow these steps to run MarketHive locally on your machine:

### **Prerequisites**
Make sure you have the following installed:
- **Node.js** (v18 or higher)  
- **npm** or **yarn**  
- **PostgreSQL** (Running locally or on a cloud service)  

---

### **Setup Instructions**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/codewithnuh/markethive.git
   cd markethive
   ```

2. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   Or, if you're using yarn:
   ```bash
   yarn
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```bash
   DATABASE_URL="postgresql://postgres:your-password@localhost:5432/markethive?schema=public"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGVzdGluZWQtZnJvZy05OC5jbGVyay5hY2NvdW50cy5kZXYk
   CLERK_SECRET_KEY=""
   GROQ_API_KEY="" # In case you want AI features
   WEBHOOK_SECRET="" # Clerk Webhook seceret
   AUTH_ID='' # Admin Clerk Id for admin role
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   STRIPE_SECRET_KEY=""
   STRIPE_WEBHOOK_SECRET=""
  
   ```

4. **Initialize the Database**
   Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Or, if using yarn:
   ```bash
   yarn dev
   ```

6. **Open in Browser**
   Visit [http://localhost:3000](http://localhost:3000) to view the application.


---

## **Admin AI Features**

- **Title & Description Enhancement**:  
  Admins can generate optimized product titles and descriptions using AI. Simply enter basic details, and MarketHive will create professional and engaging content.  
- **How to Access**:  
  AI tools are available in the **Admin Dashboard**.

---

## **Future Enhancements**
- 🔮 **Customer Recommendations**: Personalized product suggestions based on browsing history.  
- 📦 **Order Tracking**: Real-time updates on shipping and order status.  
- 📊 **Analytics Dashboard**: Insights into sales and customer behavior.  

---

## **Contributing**

We welcome contributions! To get started:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request.

---

## **License**

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

