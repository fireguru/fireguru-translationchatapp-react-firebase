import React from 'react';
// import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';

// class App extends Component {
//   render() {
//     return (
//       <div>
//         <GoogleTranslate />
//       </div>
//     );
//   }
// }

ReactDOM.render(<App />, document.getElementById('root'));
  test('renders learn react link', () => {
  act(() =>{const { getByText } = render(<App />);
  const linkElement = act(() => { getByText(/learn react/i); });
  });
  expect(linkElement).toBeInTheDocument();
  });
