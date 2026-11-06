package dev.interview.springtransactions.m17.s09;

import dev.interview.springtransactions.m17.s08.Product;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Changes a managed entity and never calls save(): the commit flushes the dirty entity. */
@Service
public class Repricing {

    private final EntityManager entityManager;

    public Repricing(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public void reprice(long productId, BigDecimal price) {
        Product product = entityManager.find(Product.class, productId);
        if (product == null) {
            throw new EntityNotFoundException("product " + productId);
        }
        product.setPrice(price);
    }
}
