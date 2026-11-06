package dev.interview.springtransactions.m17.outputs;

import dev.interview.springtransactions.m17.s08.Product;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import org.springframework.transaction.annotation.Transactional;

/** Q17.21: a managed entity is modified inside a read-only transaction. */
public class Q17_21 {

    private static final BigDecimal TWO = BigDecimal.valueOf(2);

    private final EntityManager entityManager;

    public Q17_21(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public BigDecimal doublePrice(long productId) {
        Product product = entityManager.find(Product.class, productId);
        product.setPrice(product.getPrice().multiply(TWO)); // a managed entity, changed inside readOnly
        return product.getPrice();
    }
}
