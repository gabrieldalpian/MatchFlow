export const store = {
  matches: [],
  events: [],
  insights: [],
};

export const getStore = () => store;

export const updateStore = (data: any) => {
  store.matches = data.matches;
  store.events = data.events;
  store.insights = data.insights;
};