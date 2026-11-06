create table orders (id bigint primary key, customer text not null);
create table order_line (order_id bigint not null references orders (id), sku text not null, quantity int not null check (quantity > 0));
