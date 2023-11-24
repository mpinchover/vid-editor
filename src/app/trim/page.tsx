'use client'
const videoURL = "https://regional-picture-app.s3.us-east-2.amazonaws.com/trimmed_video.mp4"
import { useEffect, useState , useRef} from "react"
import Slider from '@mui/material/Slider';

const loadScript = (src) => {
    return new Promise((onFulfilled, _) => {
      const script = document.createElement('script');
      let loaded;
      script.async = 'async';
      script.defer = 'defer';
      script.setAttribute('src', src);
      script.onreadystatechange = script.onload = () => {
        if (!loaded) {
          onFulfilled(script);
        }
        loaded = true;
      };
      script.onerror = function () {
        console.log('Script failed to load');
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  };

  const convertToHHMMSS = (val) => {
    const secNum = parseInt(val, 10);
    let hours = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - hours * 3600) / 60);
    let seconds = secNum - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    let time;
    // only mm:ss
    if (hours === '00') {
      time = minutes + ':' + seconds;
    } else {
      time = hours + ':' + minutes + ':' + seconds;
    }
    return time;
  };

export default function Home() {
    const [videoBlobURL, setVideoBlobURL] = useState("")
    const videoRef = useRef(null)
    const [value, setValue] = useState([0, 1]);
    const [videoDuration, setVideoDuration] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [videoName, setVideoName] = useState("")
    const [videoType, setVideoType] = useState("")
    const [ffmpegItem, setFfmpegItem] = useState(null)
    const [fileBuff, setFileBuff] = useState(null)

    const getVideo = async  () => {
        try {
            // console.log("GETTING...")
            const result = await fetch(videoURL, {"cache":"no-cache"})
            // console.log("CONVERTING...")
            const blob = await result.blob()

            // const arrayBuffer = await blob.arrayBuffer();
            // const bufferedFile = Buffer.from(arrayBuffer);


            setFileBuff(blob)
            // console.log("BLOB IS " )
            // console.log(blob)
            const videoBlobURL = window.URL.createObjectURL(blob)
            setVideoType(blob.type.split("/")[1])
            setVideoName(videoBlobURL.replace("blob:http://localhost:3000/", ""))
            // console.log("URL IS " )
            // console.log(videoBlobURL)
            setVideoBlobURL(videoBlobURL)
            setVideoDuration(videoRef.current?.duration)
            setEndTime(Math.ceil(videoRef.current?.duration) || 2)
            setStartTime(0)
            setValue([0, Math.ceil(videoRef.current?.duration) || 1])
            // console.log("DONE...")

            // console.log("BLOB IS")
            // console.log(blob)
        } catch (e) {
            console.log(e)
        }
    }

    const handleTrim = async () => {
        if (!ffmpegItem) {
            console.log("NO FFMPEG")
            return
        }
        ffmpegItem?.FS(
            'writeFile',
            videoName,
            await window.FFmpeg.fetchFile(fileBuff),
          );

        //   console.log("START TIME IS ", convertToHHMMSS(4))
        //   console.log("END TIME IS ", convertToHHMMSS(21))

        //   await ffmpegItem.run(
        //     '-i',
        //     videoName,
        //     '-ss',
        //     `${convertToHHMMSS(12)}`,
        //     '-to',
        //     `${convertToHHMMSS(26)}`,
        //     '-acodec',
        //     'copy',
        //     '-vcodec',
        //     'copy',
        //     `out.${videoType}`,
        //   );

        // await ffmpegItem.run(
        //         '-ss',
        //         `${convertToHHMMSS(startTime)}`,
        //         '-to',
        //         `${convertToHHMMSS(endTime)}`,
        //         '-i',
        //         videoName,
        //         '-c',
        //         'copy',
        //         '-map',
        //         '0',
        //         `out.${videoType}`,
        //       );

        // best result yet
        // await ffmpegItem.run(
        //     '-ss',
        //     `${convertToHHMMSS(4)}`,
        //     '-to',
        //     `${convertToHHMMSS(14)}`,
        //     '-i',
        //     videoName,
        //     '-c:v',
        //     'libx264',
        //     '-c:a',
        //     'aac',
        //     `out.${videoType}`,
        //   );
          await ffmpegItem.run(
            '-ss',
            `${convertToHHMMSS(10)}`,
            '-to',
            `${convertToHHMMSS(29)}`,
            '-i',
            videoName,
            '-c:v',
            'libx264',
            '-c:a',
            'aac',
            "-c",
            "copy",
            `out.${videoType}`,
          );

          console.log("DONE")

          const data = ffmpegItem.FS('readFile', `out.${videoType}`);
          const newVideoURL = URL.createObjectURL(
            new Blob([data.buffer], { type: "video/"+ videoType }),
          );

          setVideoBlobURL(newVideoURL)
        //   videoRef.current.play()


    }

    // concatenate two videos next

    const loadupScript = async () => {
        try {
            await loadScript(
                'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js',
            )
            const ffmpeg = window.FFmpeg.createFFmpeg({ log: true });
            ffmpeg.load();
            setFfmpegItem(ffmpeg)
        } catch (e) {
            console.log(e)
        }
    }

    const handleLoadup = async () => {
        await loadupScript()
        getVideo()
    }

    useEffect(() => {
        handleLoadup()

    }, [])

    const updateOnSliderChange = () => {

    }
    function valuetext(value: number) {
        return `${value}°C`;
    }

    const handleChange = (event: Event, newValue: number | number[]) => {
        // console.log("NEW VALUE IS ", newValue)
        setValue(newValue as number[]);
        setStartTime(newValue[0])
        setEndTime(newValue[1])
    };

    if (!videoBlobURL) {
        return <div>Loading...</div>
    }

    // console.log("End time is ", videoRef?.current?.duration)
    // videoRef.current.duration
    return <div>
        Video player
        <div className="w-[500px]">
            <video controls ref={videoRef} src={videoBlobURL} />
            <Slider
                min={0}
                max={videoRef?.current?.duration || 1}
                step={1}
                getAriaLabel={() => 'Temperature range'}
                value={[startTime, endTime]}
                onChange={handleChange}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
            />
        </div>
        <button className="border" onClick={handleTrim}>Trim</button>
    </div>

}
