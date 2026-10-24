// Section 7 claims, about our model (release-model.ts), not a CI service: path filters pick the pipeline and a change
// to the OpenAPI description picks both; production takes only a digest that passed staging, and a rebuild under the
// same tag is another digest; the contract check flags what breaks old clients and passes what does not; and the
// release plan expands the API first and removes the old field only after the support window. No clock, repository,
// registry or network: days are numbers and images are strings.
import {
  breakingChanges,
  canRemove,
  digestOf,
  moveTag,
  promote,
  releasePlan,
  resolveTag,
  selectPipelines,
  supportWindowDays,
  type Description,
  type Passed,
  type Tags,
} from './release-model';

const BEFORE: Description = {
  requests: {
    CreateOrder: { properties: { sku: 'string', quantity: 'integer', note: 'string' }, required: ['sku', 'quantity'] },
  },
  responses: {
    Order: { properties: { id: 'string', total: 'number', status: 'string' }, required: ['id', 'total', 'status'] },
  },
};

describe('Module 44 · section 7', () => {
  it('Section 7: a change under frontend/ selects only the frontend pipeline and a change to the OpenAPI description selects both', () => {
    expect(selectPipelines(['frontend/src/app/orders.ts'])).toEqual(['frontend']);
    expect(selectPipelines(['backend/src/main/java/OrderController.java'])).toEqual(['backend']);
    expect(selectPipelines(['contract/openapi.yaml'])).toEqual(['frontend', 'backend']);
    expect(selectPipelines(['frontend/package.json', 'backend/pom.xml'])).toEqual(['frontend', 'backend']);
    // A README matches no path filter, so no pipeline runs for it.
    expect(selectPipelines(['README.md'])).toEqual([]);
  });

  it('Section 7: production accepts only the digest that passed staging and refuses a rebuilt image with the same tag', () => {
    const tested = digestOf('bundle built from commit a1b2c3 with lockfile one');
    const rebuilt = digestOf('bundle built from commit a1b2c3 with lockfile two');
    expect(digestOf('bundle built from commit a1b2c3 with lockfile one')).toBe(tested);
    expect(rebuilt).not.toBe(tested);

    let tags: Tags = moveTag({}, 'app:a1b2c3', tested);
    let passed: Passed = promote({}, tested, 'build');
    expect(() => promote(passed, tested, 'production')).toThrow('did not pass staging');
    passed = promote(passed, tested, 'staging');

    // The same tag is rebuilt and moves to another image; the digest that passed staging does not move.
    tags = moveTag(tags, 'app:a1b2c3', rebuilt);
    expect(() => promote(passed, resolveTag(tags, 'app:a1b2c3'), 'production')).toThrow('did not pass staging');
    expect(promote(passed, tested, 'production')[tested]).toEqual(['build', 'staging', 'production']);
  });

  it('Section 7: removing a response property or adding a required request property fails the contract check and adding an optional property passes', () => {
    const removed: Description = {
      ...BEFORE,
      responses: { Order: { properties: { id: 'string', total: 'number' }, required: ['id', 'total'] } },
    };
    expect(breakingChanges(BEFORE, removed)).toEqual(['responses.Order.status: removed']);

    const requiredAdded: Description = {
      ...BEFORE,
      requests: {
        CreateOrder: {
          properties: { sku: 'string', quantity: 'integer', note: 'string', coupon: 'string' },
          required: ['sku', 'quantity', 'coupon'],
        },
      },
    };
    expect(breakingChanges(BEFORE, requiredAdded)).toEqual(['requests.CreateOrder.coupon: now required']);

    const optionalAdded: Description = {
      requests: {
        CreateOrder: {
          properties: { sku: 'string', quantity: 'integer', note: 'string', coupon: 'string' },
          required: ['sku', 'quantity'],
        },
      },
      responses: {
        Order: {
          properties: { id: 'string', total: 'number', status: 'string', currency: 'string' },
          required: ['id', 'total', 'status'],
        },
      },
    };
    expect(breakingChanges(BEFORE, optionalAdded)).toEqual([]);

    // An optional property that becomes required is as breaking as a new required one.
    const nowRequired: Description = {
      ...BEFORE,
      requests: {
        CreateOrder: {
          properties: BEFORE.requests['CreateOrder']?.properties ?? {},
          required: ['sku', 'quantity', 'note'],
        },
      },
    };
    expect(breakingChanges(BEFORE, nowRequired)).toEqual(['requests.CreateOrder.note: now required']);
  });

  it('Section 7: the release plan deploys the expanded API before the client and removes the old field only after the support window', () => {
    const plan = releasePlan({ apiDay: 0, clientDay: 1, oldTabDays: 7, cachedBundleDays: 30 });
    expect(plan.map((step) => step.action)).toEqual([
      'deploy the API that accepts old and new',
      'deploy the client',
      'remove the old field',
    ]);
    // The window is the longer of an open tab and a cached bundle, counted from the day the new client ships.
    expect(supportWindowDays(7, 30)).toBe(30);
    expect(plan.map((step) => step.day)).toEqual([0, 1, 31]);
    expect(canRemove(plan, 30)).toBe(false);
    expect(canRemove(plan, 31)).toBe(true);
    expect(() => releasePlan({ apiDay: 2, clientDay: 1, oldTabDays: 7, cachedBundleDays: 30 })).toThrow(
      'cannot ship before the API',
    );
  });
});
