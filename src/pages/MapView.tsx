import { useSearchParams } from 'react-router-dom';
import { AddressLocationMap } from '@/components/AddressLocationMap';

export const MapView = () => {
  const [searchParams] = useSearchParams();
  
  const latitude = Number(searchParams.get('lat'));
  const longitude = Number(searchParams.get('lng'));
  const street = searchParams.get('street') || '';
  const city = searchParams.get('city') || '';
  const region = searchParams.get('region') || '';
  const country = searchParams.get('country') || '';
  const building = searchParams.get('building') || '';
  const uac = searchParams.get('uac') || '';

  if (!latitude || !longitude) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Invalid location parameters</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <h1 className="font-semibold text-lg">{uac}</h1>
        <p className="text-sm text-muted-foreground">
          {building && `${building}, `}{street}, {city}, {region}
        </p>
      </div>
      
      <AddressLocationMap
        latitude={latitude}
        longitude={longitude}
        address={{
          street,
          city,
          region,
          country,
          building
        }}
        onClose={() => window.close()}
        allowResize={true}
      />
    </div>
  );
};

export default MapView;