import { isStoredImageReference } from './image-storage.service';

describe('Image storage references', () => {
  it('identifies a private image reference', () => {
    expect(isStoredImageReference('rave-route-image://images/festival.jpg')).toBeTrue();
  });

  it('does not identify ordinary image URLs as private references', () => {
    expect(isStoredImageReference('data:image/jpeg;base64,image-data')).toBeFalse();
    expect(isStoredImageReference('https://example.com/festival.jpg')).toBeFalse();
  });
});
