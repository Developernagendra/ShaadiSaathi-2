import toast from 'react-hot-toast';
import api from './api';

/**
 * Adds an auspicious wedding date to the user's Wedding Planner (local & backend)
 */
export const addDateToWeddingPlanner = async ({ date, title = 'Wedding Day', city = 'Bihar' }) => {
  try {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    localStorage.setItem('shaadisaathi_planner_date', JSON.stringify({
      date: formattedDate,
      title,
      city,
      savedAt: new Date().toISOString()
    }));

    // Try syncing with active backend wedding plan if authenticated
    try {
      const { data } = await api.get('/weddings/my');
      if (data && data.plan && data.plan._id) {
        await api.put(`/weddings/${data.plan._id}`, {
          weddingDate: formattedDate,
          weddingCity: city
        });
        toast.success(`Wedding date (${formattedDate}) synced to your active Wedding Plan! 💍`);
        return true;
      }
    } catch (err) {
      // Backend plan not present or user not logged in; fallback to localStorage
    }

    toast.success(`Wedding date (${formattedDate}) added to your Wedding Planner! 💍`);
    return true;
  } catch (error) {
    console.error('Error adding date to planner:', error);
    toast.error('Could not save date to Wedding Planner.');
    return false;
  }
};

/**
 * Adds an event (e.g. Muhurat ceremony) to the Wedding Timeline (local & backend)
 */
export const addEventToWeddingTimeline = async ({
  title = 'Shubh Muhurat Ceremony',
  date,
  time = '10:45 AM',
  location = 'Bihar Wedding Venue',
  notes = 'Auspicious Muhurat timing selected from ShaadiSaathi Panchang'
}) => {
  try {
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const newEvent = {
      _id: 'muhurat-' + Date.now(),
      title,
      date: formattedDate,
      time,
      location,
      notes,
      description: 'Auspicious ceremonial timing selected via ShaadiSaathi Shubh Muhurat tool.',
      isCompleted: false
    };

    // Save locally
    const existingRaw = localStorage.getItem('shaadisaathi_timeline_events');
    let events = [];
    if (existingRaw) {
      try {
        events = JSON.parse(existingRaw);
      } catch (e) {
        events = [];
      }
    }
    events.push(newEvent);
    events.sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
    localStorage.setItem('shaadisaathi_timeline_events', JSON.stringify(events));

    // Sync backend if authenticated
    try {
      const { data } = await api.get('/weddings/my');
      if (data && data.plan && data.plan._id) {
        await api.post(`/weddings/${data.plan._id}/events`, newEvent);
        toast.success(`"${title}" added to your Wedding Timeline! 📅`);
        return true;
      }
    } catch (err) {
      // Silently fall back to localStorage
    }

    toast.success(`"${title}" added to your Wedding Timeline! 📅`);
    return true;
  } catch (error) {
    console.error('Error adding event to timeline:', error);
    toast.error('Could not add event to Wedding Timeline.');
    return false;
  }
};

/**
 * Favorites / Saved Muhurat Dates
 */
export const saveFavoriteMuhurat = (muhuratObj) => {
  try {
    const existingRaw = localStorage.getItem('shaadisaathi_favorite_muhurats');
    let favorites = [];
    if (existingRaw) {
      try {
        favorites = JSON.parse(existingRaw);
      } catch (e) {
        favorites = [];
      }
    }
    // Check if already saved
    if (!favorites.some((f) => f.date === muhuratObj.date)) {
      favorites.push({
        ...muhuratObj,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('shaadisaathi_favorite_muhurats', JSON.stringify(favorites));
      toast.success('Auspicious date saved to Favorites! ❤️');
      return true;
    } else {
      toast('Date is already in your favorites!', { icon: '⭐' });
      return false;
    }
  } catch (error) {
    console.error('Error saving favorite muhurat:', error);
    return false;
  }
};

/**
 * Saves a venue to the user's Wedding Plan (local & backend)
 */
export const saveVenueToWeddingPlan = async (venue) => {
  try {
    const existingRaw = localStorage.getItem('shaadisaathi_saved_venues');
    let savedVenues = [];
    if (existingRaw) {
      try {
        savedVenues = JSON.parse(existingRaw);
      } catch (e) {
        savedVenues = [];
      }
    }
    const venueId = venue._id || venue.id;
    if (!savedVenues.some((v) => (v._id || v.id) === venueId)) {
      savedVenues.push({
        ...venue,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('shaadisaathi_saved_venues', JSON.stringify(savedVenues));
      toast.success(`"${venue.businessName || venue.name}" saved to your Wedding Plan! 🏛️`);
      return true;
    } else {
      toast('Venue is already in your Wedding Plan!', { icon: '⭐' });
      return false;
    }
  } catch (error) {
    console.error('Error saving venue to wedding plan:', error);
    toast.error('Could not save venue.');
    return false;
  }
};
